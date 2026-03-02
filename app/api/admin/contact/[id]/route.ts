import { NextRequest, NextResponse } from "next/server"
import { getSessionByToken, deleteContactMessageById } from "@/lib/db"
import type { ApiResponse } from "@/lib/types"

async function isAdminAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("admin_session_token")?.value
  if (!token) return false

  const session = await getSessionByToken(token)
  return !!session && session.userType === "admin"
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!await isAdminAuthenticated(request)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Admin authentication required" },
        { status: 401 }
      )
    }

    const { id } = await params
    const success = await deleteContactMessageById(id)

    if (!success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Message not found" },
        { status: 404 }
      )
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Message deleted successfully",
    })
  } catch (error) {
    console.error("Admin delete contact message error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to delete contact message" },
      { status: 500 }
    )
  }
}
