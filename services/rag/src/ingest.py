"""Data ingestion script — processes all documents in ./docs and stores them in ChromaDB."""

import os
from pathlib import Path

import boto3
from dotenv import load_dotenv

from rag import (
    create_vector_store,
    load_embedded_docs,
    load_or_create_vector_store,
    load_summary_from_cache,
    mark_doc_embedded,
    partition_document,
    create_chunks_by_title,
    summarise_chunks,
    save_summary_to_cache,
)

load_dotenv()


def sync_docs_from_s3() -> None:
    bucket_name = os.environ.get("RAG_S3_BUCKET")
    if not bucket_name:
        return

    docs_dir = Path("./docs")
    docs_dir.mkdir(parents=True, exist_ok=True)

    s3 = boto3.client("s3")
    response = s3.list_objects_v2(Bucket=bucket_name)

    for obj in response.get("Contents", []):
        key = obj["Key"]
        if key.endswith("/"):
            continue

        local_path = docs_dir / key
        if local_path.exists():
            continue

        local_path.parent.mkdir(parents=True, exist_ok=True)
        print(f"⬇️  Downloading from S3: {key}")
        s3.download_file(bucket_name, key, str(local_path))


def main():
    sync_docs_from_s3()
    docs_dir = Path("./docs")
    embedded_docs = load_embedded_docs()
    db = load_or_create_vector_store()

    for file_path in sorted(docs_dir.rglob("*")):
        if file_path.is_dir() or any(part.startswith(".") for part in file_path.parts):
            continue

        file_str = str(file_path)
        if file_str in embedded_docs:
            print(f"⏭️  Skipping already embedded: {file_path.name}")
            continue

        print(f"\n📂 Processing: {file_path.name}")

        summarized_chunks = load_summary_from_cache(file_str)
        if summarized_chunks is None:
            print("🧠 Creating new summaries...")
            elements = partition_document(file_str)
            chunks = create_chunks_by_title(elements)
            summarized_chunks = summarise_chunks(chunks)
            save_summary_to_cache(file_str, summarized_chunks)
        else:
            print("✅ Using cached summaries")

        if db is None:
            db = create_vector_store(summarized_chunks)
        else:
            db.add_documents(summarized_chunks)
            print(f"✅ Added {len(summarized_chunks)} chunks to vector store")

        mark_doc_embedded(file_str)

    if db is None:
        print("⚠️  No documents found in ./docs — nothing to index.")
        return

    print("\n✅ Ingestion complete.")


if __name__ == "__main__":
    main()
