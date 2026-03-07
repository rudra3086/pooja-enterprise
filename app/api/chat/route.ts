import { NextRequest, NextResponse } from "next/server"
import { getWebsiteAiContext } from "@/lib/ai-context"
import type { ApiResponse } from "@/lib/types"

type ChatMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

async function generateWithGroq(messages: ChatMessage[]) {
  const apiKey = process.env.GROQ_API_KEY
  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant"
  const baseUrl = process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1"

  if (!apiKey) throw new Error("GROQ_API_KEY is missing")

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
    throw new Error(data?.error?.message || "Failed to generate chat response with Groq")
  }

  const reply = data?.choices?.[0]?.message?.content?.trim()
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

    const websiteContext = await getWebsiteAiContext()

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "system", content: `Website knowledge:\n${websiteContext.slice(0, 6000)}` },
      ...trimmedHistory,
      { role: "user", content: message.slice(0, 1200) },
    ]

    const provider = (process.env.AI_PROVIDER || "").toLowerCase()
    const useGroq = provider === "groq" || (!!process.env.GROQ_API_KEY && !process.env.OPENAI_API_KEY)

    const reply = useGroq
      ? await generateWithGroq(messages)
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
