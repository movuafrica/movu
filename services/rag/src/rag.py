import hashlib
import json
import os
import pickle
from typing import List, Optional
from pathlib import Path

from unstructured.chunking.title import chunk_by_title
import unstructured_client
from unstructured_client.models import operations, shared
from unstructured.staging.base import elements_from_dicts

# LangChain components
from langchain_core.documents import Document
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv

import chromadb


CACHE_DIR = Path(".cache")
CACHE_DIR.mkdir(exist_ok=True)
ORIGINAL_CONTENT_DIR = CACHE_DIR / "original_content"
ORIGINAL_CONTENT_DIR.mkdir(exist_ok=True)

load_dotenv()

CHROMA_COLLECTION = "movu_rag"
REFUSAL_PATTERNS = (
    "i'm sorry, i can't assist with that",
    "i cannot assist with that",
    "i can't assist with that",
    "i’m sorry, i can’t assist with that",
    "i’m unable to help with that",
    "i cannot help with that",
)


# Singleton for ChromaDB CloudClient
_chroma_client: Optional[chromadb.CloudClient] = None

def _get_chroma_http_client() -> Optional[chromadb.CloudClient]:
    """Return a singleton ChromaDB CloudClient."""
    global _chroma_client
    if _chroma_client is not None:
        return _chroma_client
    api_key = os.environ.get("CHROMA_API_KEY")
    tenant = os.environ.get("CHROMA_TENANT")
    database = os.environ.get("CHROMA_DATABASE")
    if api_key and tenant and database:
        _chroma_client = chromadb.CloudClient(
            api_key=api_key,
            tenant=tenant,
            database=database
        )
        return _chroma_client
    return None

# Singleton for UnstructuredClient
_unstructured_client: Optional[unstructured_client.UnstructuredClient] = None
def _get_unstructured_client() -> unstructured_client.UnstructuredClient:
    global _unstructured_client
    if _unstructured_client is not None:
        return _unstructured_client
    api_key = os.environ.get("UNSTRUCTURED_API_KEY")
    if not api_key:
        raise RuntimeError("UNSTRUCTURED_API_KEY environment variable not set.")
    _unstructured_client = unstructured_client.UnstructuredClient(api_key_auth=api_key)
    return _unstructured_client


def get_cache_path(file_path: str) -> Path:
    pdf_name = Path(file_path).stem
    return CACHE_DIR / f"{pdf_name}.pkl"


def partition_document(file_path: str):
    cache_path = get_cache_path(file_path)

    if cache_path.exists():
        print(f"♻️ Loading cached partitioned document: {cache_path}")
        with open(cache_path, "rb") as f:
            elements = pickle.load(f)
        print(f"✅ Loaded {len(elements)} elements from cache")
        return elements

    print(f"📄 Partitioning document via Unstructured API: {file_path}")
    client = _get_unstructured_client()
    with open(file_path, "rb") as f:
        file_bytes = f.read()
    params = shared.PartitionParameters(
        files=shared.Files(content=file_bytes, file_name=os.path.basename(file_path)),
        strategy=shared.Strategy.HI_RES,
        extract_image_block_types=["Image"],
        infer_table_structure=True,
        split_pdf_page=True,
        split_pdf_allow_failed=True,
    )
    req = operations.PartitionRequest(partition_parameters=params)
    res = client.general.partition(request=req)
    element_dicts = res.elements
    elements = elements_from_dicts(element_dicts)
    print(f"✅ Extracted {len(elements)} elements from Unstructured API")

    with open(cache_path, "wb") as f:
        pickle.dump(elements, f)
    print(f"💾 Cached partitioned document at {cache_path}")

    return elements


def get_images(elements: List[Document]) -> List[str]:
    images = [element for element in elements if element.category == "Image"]
    print(f"Found {len(images)} images")
    return images


def get_tables(elements: List[Document]) -> List[str]:
    tables = [element for element in elements if element.category == "Table"]
    print(f"Found {len(tables)} tables")
    return tables


def create_chunks_by_title(elements: List[Document]) -> List[str]:
    print("🔨 Creating smart chunks...")

    chunks = chunk_by_title(
        elements,
        max_characters=3000,
        new_after_n_chars=2400,
        combine_text_under_n_chars=500,
    )

    print(f"✅ Created {len(chunks)} chunks")
    return chunks


def separate_content_types(chunk):
    content_data = {
        "text": chunk.text,
        "tables": [],
        "images": [],
        "types": ["text"],
    }

    if (
        hasattr(chunk, "metadata")
        and hasattr(chunk.metadata, "orig_elements")
        and chunk.metadata.orig_elements is not None
    ):
        for element in chunk.metadata.orig_elements:
            element_type = type(element).__name__

            if element_type == "Table":
                content_data["types"].append("table")
                table_html = getattr(element.metadata, "text_as_html", element.text)
                content_data["tables"].append(table_html)

            elif element_type == "Image":
                if hasattr(element, "metadata") and hasattr(
                    element.metadata, "image_base64"
                ):
                    content_data["types"].append("image")
                    content_data["images"].append(element.metadata.image_base64)

    content_data["types"] = list(set(content_data["types"]))
    return content_data


def create_ai_enhanced_summary(
    text: str, tables: List[str], images: List[str]
) -> str:
    try:
        llm = ChatOpenAI(model="gpt-4o", temperature=0)

        prompt_text = f"""You are creating a searchable retrieval summary for an internal document chunk.

Your job is to convert the provided document content into a factual, high-recall summary for semantic search.

Rules:
- Stay grounded in the provided content only.
- Do not answer the user's question.
- Do not mention safety policies or refusal language.
- If the content is noisy, incomplete, or hard to interpret, still extract keywords, entities, codes, numbers, headings, and likely topics.
- Prefer recall over brevity.

CONTENT TO ANALYZE:
TEXT CONTENT:
{text}

"""

        if tables:
            prompt_text += "TABLES:\n"
            for i, table in enumerate(tables):
                prompt_text += f"Table {i+1}:\n{table}\n\n"

        if images:
            prompt_text += f"IMAGES: {len(images)} image(s) attached for analysis.\n\n"

        prompt_text += """YOUR TASK:
Generate a comprehensive searchable description that includes:

1. Main topics, entities, document types, and concepts
2. Key facts, numbers, dates, identifiers, product names, and codes
3. Important details from tables and images, if present
4. Questions this chunk could help answer
5. Alternative search terms, synonyms, abbreviations, and related phrases

Output requirements:
- Write plain prose, not JSON.
- Be specific and keyword-rich.
- If the content is partially unreadable, say what is still clearly identifiable.
- Never output a refusal. Never say you cannot assist.

SEARCHABLE DESCRIPTION:"""

        message_content = [{"type": "text", "text": prompt_text}]

        for image_base64 in images:
            message_content.append(
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"},
                }
            )

        message = HumanMessage(content=message_content)
        response = llm.invoke([message])

        return response.content

    except Exception as e:
        print(f"     ❌ AI summary failed: {e}")
        summary = f"{text[:300]}..."
        if tables:
            summary += f" [Contains {len(tables)} table(s)]"
        if images:
            summary += f" [Contains {len(images)} image(s)]"
        return summary


def _detect_summary_issue(summary: str) -> Optional[str]:
    normalized = summary.strip().lower()
    if not normalized:
        return "empty"

    for pattern in REFUSAL_PATTERNS:
        if pattern in normalized:
            return "refusal"

    return None


def get_summary_cache_path(file_path: str) -> Path:
    pdf_name = Path(file_path).stem
    return CACHE_DIR / f"{pdf_name}_summary.pkl"


def save_summary_to_cache(file_path: str, summarized_chunks):
    cache_path = get_summary_cache_path(file_path)
    with open(cache_path, "wb") as f:
        pickle.dump(summarized_chunks, f)
    print(f"💾 Cached summarized chunks at {cache_path}")


def load_summary_from_cache(file_path: str):
    cache_path = get_summary_cache_path(file_path)
    if cache_path.exists():
        print(f"♻️ Loading cached summarized chunks from {cache_path}")
        with open(cache_path, "rb") as f:
            return pickle.load(f)
    return None


EMBEDDED_DOCS_PATH = CACHE_DIR / "embedded_docs.json"


def load_embedded_docs() -> set:
    if EMBEDDED_DOCS_PATH.exists():
        return set(json.loads(EMBEDDED_DOCS_PATH.read_text()))
    return set()


def mark_doc_embedded(file_path: str):
    embedded = load_embedded_docs()
    embedded.add(file_path)
    EMBEDDED_DOCS_PATH.write_text(json.dumps(sorted(embedded)))


def _store_original_content(original_content: dict) -> str:
    serialized = json.dumps(original_content, sort_keys=True)
    content_id = hashlib.sha256(serialized.encode("utf-8")).hexdigest()
    content_path = ORIGINAL_CONTENT_DIR / f"{content_id}.json"

    if not content_path.exists():
        content_path.write_text(serialized)

    return content_id


def _load_original_content(chunk: Document) -> dict:
    if "original_content" in chunk.metadata:
        return json.loads(chunk.metadata["original_content"])

    content_id = chunk.metadata.get("original_content_id")
    if not content_id:
        return {}

    content_path = ORIGINAL_CONTENT_DIR / f"{content_id}.json"
    if not content_path.exists():
        print(f"⚠️  Missing original content sidecar: {content_path}")
        return {}

    return json.loads(content_path.read_text())


def _prepare_documents_for_vector_store(documents: List[Document]) -> List[Document]:
    prepared_documents = []

    for doc in documents:
        metadata = dict(doc.metadata)

        if "original_content" in metadata:
            content_id = _store_original_content(json.loads(metadata["original_content"]))
            metadata.pop("original_content", None)
            metadata["original_content_id"] = content_id

        prepared_documents.append(
            Document(page_content=doc.page_content, metadata=metadata)
        )

    return prepared_documents


def summarise_chunks(chunks) -> List[Document]:
    print("🧠 Processing chunks with AI Summaries...")

    langchain_documents = []
    total_chunks = len(chunks)

    for i, chunk in enumerate(chunks):
        current_chunk = i + 1
        print(f"   Processing chunk {current_chunk}/{total_chunks}")

        content_data = separate_content_types(chunk)

        print(f"     Types found: {content_data['types']}")
        print(
            f"     Tables: {len(content_data['tables'])}, Images: {len(content_data['images'])}"
        )

        metadata = {
            "content_types": ",".join(sorted(content_data["types"])),
            "has_tables": len(content_data["tables"]) > 0,
            "has_images": len(content_data["images"]) > 0,
            "summary_status": "raw_text",
        }

        if content_data["tables"] or content_data["images"]:
            print(f"     → Creating AI summary for mixed content...")
            try:
                ai_summary = create_ai_enhanced_summary(
                    content_data["text"],
                    content_data["tables"],
                    content_data["images"],
                )
                summary_issue = _detect_summary_issue(ai_summary)

                if summary_issue is None:
                    enhanced_content = ai_summary
                    metadata["summary_status"] = "ai_summary"
                    print(f"     → AI summary created successfully")
                    print(f"     → Enhanced content preview: {enhanced_content[:200]}...")
                else:
                    enhanced_content = content_data["text"]
                    metadata["summary_status"] = f"fallback_{summary_issue}"
                    print(
                        f"     ⚠️  AI summary returned {summary_issue}; falling back to raw text"
                    )
            except Exception as e:
                print(f"     ❌ AI summary failed: {e}")
                enhanced_content = content_data["text"]
                metadata["summary_status"] = "fallback_error"
        else:
            print(f"     → Using raw text (no tables/images)")
            enhanced_content = content_data["text"]

        original_content = {
            "raw_text": content_data["text"],
            "tables_html": content_data["tables"],
            "images_base64": content_data["images"],
        }
        content_id = _store_original_content(original_content)

        doc = Document(
            page_content=enhanced_content,
            metadata={**metadata, "original_content_id": content_id},
        )

        langchain_documents.append(doc)

    print(f"✅ Processed {len(langchain_documents)} chunks")
    return langchain_documents


def create_vector_store(
    documents: List[Document], persist_directory: str = "dbv1/chroma_db"
) -> Chroma:
    print("🔮 Creating embeddings and storing in ChromaDB...")
    documents = _prepare_documents_for_vector_store(documents)

    embedding_model = OpenAIEmbeddings(model="text-embedding-3-small")
    http_client = _get_chroma_http_client()

    if http_client:
        vectorstore = Chroma.from_documents(
            documents=documents,
            embedding=embedding_model,
            client=http_client,
            collection_name=CHROMA_COLLECTION,
            collection_metadata={"hnsw:space": "cosine"},
        )
    else:
        vectorstore = Chroma.from_documents(
            documents=documents,
            embedding=embedding_model,
            persist_directory=persist_directory,
            collection_name=CHROMA_COLLECTION,
            collection_metadata={"hnsw:space": "cosine"},
        )

    print(f"✅ Vector store created")
    return vectorstore


def load_or_create_vector_store(
    persist_directory: str = "dbv1/chroma_db",
) -> Optional[Chroma]:
    embedding_model = OpenAIEmbeddings(model="text-embedding-3-small")
    http_client = _get_chroma_http_client()

    if http_client:
        try:
            vs = Chroma(
                embedding_function=embedding_model,
                client=http_client,
                collection_name=CHROMA_COLLECTION,
                collection_metadata={"hnsw:space": "cosine"},
            )
            if vs._collection.count() > 0:
                print("✅ Vector store loaded from ChromaDB HTTP server")
                return vs
            print("⚠️  ChromaDB collection is empty — run ingest first")
            return None
        except Exception as e:
            print(f"⚠️  Could not connect to ChromaDB HTTP server: {e}")
            return None
    else:
        if Path(persist_directory).exists():
            print("✅ Vector store already exists, loading from disk")
            return Chroma(
                persist_directory=persist_directory,
                embedding_function=embedding_model,
                collection_name=CHROMA_COLLECTION,
                collection_metadata={"hnsw:space": "cosine"},
            )
        return None


def generate_final_answer(chunks: List[Document], query: str) -> str:
    try:
        llm = ChatOpenAI(model="gpt-4o", temperature=0)

        prompt_text = f"""Based on the following documents, please answer this question: {query}

CONTENT TO ANALYZE:
"""

        for i, chunk in enumerate(chunks):
            prompt_text += f"--- Document {i+1} ---\n"

            original_data = _load_original_content(chunk)

            raw_text = original_data.get("raw_text", "")
            if raw_text:
                prompt_text += f"TEXT:\n{raw_text}\n\n"

            tables_html = original_data.get("tables_html", [])
            if tables_html:
                prompt_text += "TABLES:\n"
                for j, table in enumerate(tables_html):
                    prompt_text += f"Table {j+1}:\n{table}\n\n"

            prompt_text += "\n"

        prompt_text += """
Please provide a clear, comprehensive answer using the text, tables, and images above. If the documents don't contain sufficient information to answer the question, say "I don't have enough information to answer that question based on the provided documents."

ANSWER:"""

        message_content = [{"type": "text", "text": prompt_text}]

        for chunk in chunks:
            original_data = _load_original_content(chunk)
            images_base64 = original_data.get("images_base64", [])

            for image_base64 in images_base64:
                message_content.append(
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"},
                    }
                )

        message = HumanMessage(content=message_content)
        response = llm.invoke([message])

        return response.content

    except Exception as e:
        print(f"❌ Answer generation failed: {e}")
        return "Sorry, I encountered an error while generating the answer."
