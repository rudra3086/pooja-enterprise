import { NextRequest, NextResponse } from "next/server"
import { getContactMessageById, getSessionByToken } from "@/lib/db"
import type { ApiResponse } from "@/lib/types"

async function getAdminSession(request: NextRequest): Promise<{ userId: string } | null> {
  const token = request.cookies.get("admin_session_token")?.value
  if (!token) return null

  const session = await getSessionByToken(token)
  if (!session || session.userType !== "admin") return null

  return { userId: session.userId }
}

type ChatMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

async function generateWithGroq(messages: ChatMessage[]) {
  const apiKey = process.env.GROQ_API_KEY
  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant"
  const baseUrl = process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1"

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing")
  }

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
    throw new Error(data?.error?.message || "Failed to generate AI draft with Groq")
  }

  const draft = data?.choices?.[0]?.message?.content?.trim()
  if (!draft) {
    throw new Error("AI draft was empty")
  }

  return draft
}

async function generateWithOpenAI(messages: ChatMessage[]) {
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini"
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing")
  }

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
    throw new Error(data?.error?.message || "Failed to generate AI draft with OpenAI")
  }

  const draft = data?.choices?.[0]?.message?.content?.trim()
  if (!draft) {
    throw new Error("AI draft was empty")
  }

  return draft
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = await getAdminSession(request)
    if (!adminSession) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Admin authentication required" },
        { status: 401 }
      )
    }

    const { id } = await params
    const message = await getContactMessageById(id)
    if (!message) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Message not found" },
        { status: 404 }
      )
    }

    const prompt = [
      "Write a professional, concise customer support email reply for a B2B packaging supplier.",
      "Keep it polite, clear, and actionable.",
      "Do not invent prices, delivery dates, or commitments.",
      "If details are missing, ask 1-2 short clarifying questions.",
      "Return plain text only (no markdown, no subject line).",
      "",
      `Customer Name: ${message.name}`,
      `Customer Email: ${message.email}`,
      `Company: ${message.company || "N/A"}`,
      `Subject: ${message.subject}`,
      `Inquiry: ${message.message}`,
    ].join("\n")

    const messages: ChatMessage[] = [
      {
        role: "system",
        content: "You are a customer support assistant for Pooja Enterprise. Keep responses professional, brief, and business-friendly.",
      },
      { role: "user", content: prompt },
    ]

    const provider = (process.env.AI_PROVIDER || "").toLowerCase()
    const useGroq = provider === "groq" || (!!process.env.GROQ_API_KEY && !process.env.OPENAI_API_KEY)

    const draft = useGroq
      ? await generateWithGroq(messages)
      : await generateWithOpenAI(messages)

    return NextResponse.json<ApiResponse<{ draft: string }>>({
      success: true,
      data: { draft },
      message: "AI draft generated",
    })
  } catch (error) {
    console.error("Admin AI draft error:", error)
    const message = error instanceof Error ? error.message : "Failed to generate AI draft"
    return NextResponse.json<ApiResponse>(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
