import { NextRequest, NextResponse } from "next/server"
import type { ApiResponse } from "@/lib/types"

type ChatMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

async function generateWithOllama(messages: ChatMessage[]) {
  const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434"
  const ollamaModel = process.env.OLLAMA_MODEL || "llama3.2:3b"

  const response = await fetch(`${ollamaBaseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: ollamaModel,
      messages,
      stream: false,
      options: { temperature: 0.5 },
    }),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data?.error || "Failed to generate chat response with Ollama")
  }

  const reply = data?.message?.content?.trim()
  if (!reply) throw new Error("AI response was empty")
  return reply
}

async function generateWithOpenAI(messages: ChatMessage[]) {
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini"
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"

  if (!apiKey) throw new Error("OPENAI_API_KEY is missing")

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.5,
      messages,
    }),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data?.error?.message || "Failed to generate chat response with OpenAI")
  }

  const reply = data?.choices?.[0]?.message?.content?.trim()
  if (!reply) throw new Error("AI response was empty")
  return reply
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const message = typeof body?.message === "string" ? body.message.trim() : ""
    const history = Array.isArray(body?.history) ? body.history : []

    if (!message) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Message is required" },
        { status: 400 }
      )
    }

    const trimmedHistory: ChatMessage[] = history
      .filter((item: any) => item && (item.role === "user" || item.role === "assistant") && typeof item.content === "string")
      .slice(-8)
      .map((item: any) => ({ role: item.role, content: String(item.content).slice(0, 1200) }))

    const systemPrompt = [
      "You are the website assistant for Pooja Enterprise, a B2B tissue and packaging supplier.",
      "Answer briefly, clearly, and professionally.",
      "Only discuss relevant topics: products, customization, bulk ordering, pricing inquiry process, delivery, business info, and contact support.",
      "Do not invent exact prices, delivery timelines, or policies. If unknown, ask user to contact sales and provide a concise next step.",
      "If question is unrelated, politely redirect to business-related help.",
    ].join(" ")

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...trimmedHistory,
      { role: "user", content: message.slice(0, 1200) },
    ]

    const provider = (process.env.AI_PROVIDER || "").toLowerCase()
    const useOllama = provider === "ollama" || (!!process.env.OLLAMA_BASE_URL && !process.env.OPENAI_API_KEY)

    const reply = useOllama
      ? await generateWithOllama(messages)
      : await generateWithOpenAI(messages)

    return NextResponse.json<ApiResponse<{ reply: string }>>({
      success: true,
      data: { reply },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate reply"
    return NextResponse.json<ApiResponse>(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
