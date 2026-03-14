"""FastAPI application exposing the RAG system as a REST API."""

import os
import sys
from pathlib import Path

# Ensure the src directory is on the path when run from services/rag/
sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from rag import generate_final_answer, load_or_create_vector_store

load_dotenv()

app = FastAPI(title="Movu RAG API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the vector store once at startup
_vector_store = None


@app.on_event("startup")
async def startup_event():
    global _vector_store
    _vector_store = load_or_create_vector_store()
    if _vector_store is None:
        print(
            "⚠️  Vector store not found. Run ingest.py first to index your documents."
        )


class ChatRequest(BaseModel):
    prompt: str


class ChatResponse(BaseModel):
    answer: str


@app.get("/health")
async def health():
    return {"status": "ok", "vector_store_ready": _vector_store is not None}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt must not be empty.")

    if _vector_store is None:
        raise HTTPException(
            status_code=503,
            detail="Vector store is not available. Run ingest.py to index documents first.",
        )

    retriever = _vector_store.as_retriever(search_kwargs={"k": 3})
    chunks = retriever.invoke(request.prompt)
    answer = generate_final_answer(chunks, request.prompt)

    return ChatResponse(answer=answer)
