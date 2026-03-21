"use server"

const RAG_API_URL = process.env.RAG_API_URL ?? "http://localhost:8000"

export async function sendChatMessage(prompt: string): Promise<string> {
  const res = await fetch(`${RAG_API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  })

  if (!res.ok) {
    throw new Error(`RAG API responded with status ${res.status}`)
  }

  const data = (await res.json()) as { answer: string }
  return data.answer
}
