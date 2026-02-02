import { NextRequest, NextResponse } from "next/server"
import { getSessionByToken, getAdminById, deleteSession } from "@/lib/db"
import type { AuthResponse } from "@/lib/types"

// GET /api/admin/auth/session - Get current admin session
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_session_token")?.value

    if (!token) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      )
    }

    // Validate token and get session from database
    const session = await getSessionByToken(token)
    
    if (!session || session.userType !== "admin") {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Session expired" },
        { status: 401 }
      )
    }

    // Get admin data
    const admin = await getAdminById(session.userId)

    if (!admin) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "User not found" },
        { status: 401 }
      )
    }

    return NextResponse.json<AuthResponse>({
      success: true,
      user: admin,
    })
  } catch (error) {
    console.error("Admin session error:", error)
    return NextResponse.json<AuthResponse>(
      { success: false, message: "An error occurred" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/auth/session - Admin logout
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_session_token")?.value

    if (token) {
      await deleteSession(token)
    }

    const response = NextResponse.json<AuthResponse>({
      success: true,
      message: "Logged out successfully",
    })

    response.cookies.delete("admin_session_token")

    return response
  } catch (error) {
    console.error("Admin logout error:", error)
    return NextResponse.json<AuthResponse>(
      { success: false, message: "An error occurred during logout" },
      { status: 500 }
    )
  }
}
