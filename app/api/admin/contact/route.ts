import { NextRequest, NextResponse } from "next/server"
import { getSessionByToken, getContactMessages } from "@/lib/db"
import type { ApiResponse, ContactMessage, PaginatedResponse } from "@/lib/types"

async function isAdminAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("admin_session_token")?.value
  if (!token) return false

  const session = await getSessionByToken(token)
  return !!session && session.userType === "admin"
}

export async function GET(request: NextRequest) {
  try {
    if (!await isAdminAuthenticated(request)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Admin authentication required" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as "new" | "replied" | null
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")

    const { messages, total } = await getContactMessages({
      status: status === "new" || status === "replied" ? status : undefined,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    })

    return NextResponse.json<ApiResponse<PaginatedResponse<ContactMessage>>>({
      success: true,
      data: {
        data: messages,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error("Admin get contact messages error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to fetch contact messages" },
      { status: 500 }
    )
  }
}
