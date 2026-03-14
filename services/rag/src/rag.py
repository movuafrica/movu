import json
import pickle
from typing import List, Optional
from pathlib import Path

# Unstructured for document parsing
from unstructured.partition.pdf import partition_pdf
from unstructured.partition.auto import partition as partition_auto
from unstructured.chunking.title import chunk_by_title

# LangChain components
from langchain_core.documents import Document
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv


CACHE_DIR = Path(".cache")
CACHE_DIR.mkdir(exist_ok=True)

load_dotenv()


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

    print(f"📄 Partitioning document: {file_path}")
    ext = Path(file_path).suffix.lower()
    if ext == ".pdf":
        elements = partition_pdf(
            filename=file_path,
            strategy="hi_res",
            infer_table_structure=True,
            extract_image_block_types=["Image"],
            extract_image_block_to_payload=True,
        )
    else:
        elements = partition_auto(filename=file_path)
    print(f"✅ Extracted {len(elements)} elements")

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

        prompt_text = f"""You are creating a searchable description for document content retrieval.

        CONTENT TO ANALYZE:
        TEXT CONTENT:
        {text}

        """

        if tables:
            prompt_text += "TABLES:\n"
            for i, table in enumerate(tables):
                prompt_text += f"Table {i+1}:\n{table}\n\n"

            prompt_text += """
                YOUR TASK:
                Generate a comprehensive, searchable description that covers:

                1. Key facts, numbers, and data points from text and tables
                2. Main topics and concepts discussed  
                3. Questions this content could answer
                4. Visual content analysis (charts, diagrams, patterns in images)
                5. Alternative search terms users might use

                Make it detailed and searchable - prioritize findability over brevity.

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

        if content_data["tables"] or content_data["images"]:
            print(f"     → Creating AI summary for mixed content...")
            try:
                enhanced_content = create_ai_enhanced_summary(
                    content_data["text"],
                    content_data["tables"],
                    content_data["images"],
                )
                print(f"     → AI summary created successfully")
                print(f"     → Enhanced content preview: {enhanced_content[:200]}...")
            except Exception as e:
                print(f"     ❌ AI summary failed: {e}")
                enhanced_content = content_data["text"]
        else:
            print(f"     → Using raw text (no tables/images)")
            enhanced_content = content_data["text"]

        doc = Document(
            page_content=enhanced_content,
            metadata={
                "original_content": json.dumps(
                    {
                        "raw_text": content_data["text"],
                        "tables_html": content_data["tables"],
                        "images_base64": content_data["images"],
                    }
                )
            },
        )

        langchain_documents.append(doc)

    print(f"✅ Processed {len(langchain_documents)} chunks")
    return langchain_documents


def create_vector_store(
    documents: List[Document], persist_directory: str = "dbv1/chroma_db"
) -> Chroma:
    print("🔮 Creating embeddings and storing in ChromaDB...")

    embedding_model = OpenAIEmbeddings(model="text-embedding-3-small")

    print("--- Creating vector store ---")
    vectorstore = Chroma.from_documents(
        documents=documents,
        embedding=embedding_model,
        persist_directory=persist_directory,
        collection_metadata={"hnsw:space": "cosine"},
    )
    print("--- Finished creating vector store ---")

    print(f"✅ Vector store created and saved to {persist_directory}")
    return vectorstore


def load_or_create_vector_store(
    persist_directory: str = "dbv1/chroma_db",
) -> Optional[Chroma]:
    embedding_model = OpenAIEmbeddings(model="text-embedding-3-small")
    if Path(persist_directory).exists():
        print("✅ Vector store already exists, loading from disk")
        return Chroma(
            persist_directory=persist_directory,
            embedding_function=embedding_model,
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

            if "original_content" in chunk.metadata:
                original_data = json.loads(chunk.metadata["original_content"])

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
            if "original_content" in chunk.metadata:
                original_data = json.loads(chunk.metadata["original_content"])
                images_base64 = original_data.get("images_base64", [])

                for image_base64 in images_base64:
                    message_content.append(
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}"
                            },
                        }
                    )

        message = HumanMessage(content=message_content)
        response = llm.invoke([message])

        return response.content

    except Exception as e:
        print(f"❌ Answer generation failed: {e}")
        return "Sorry, I encountered an error while generating the answer."
