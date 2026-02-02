import { NextRequest, NextResponse } from "next/server"
import { getSessionByToken, getClientById, deleteSession } from "@/lib/db"
import type { AuthResponse } from "@/lib/types"

// GET /api/auth/session - Get current session
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("session_token")?.value

    if (!token) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      )
    }

    // Validate token and get session from database
    const session = await getSessionByToken(token)
    
    if (!session) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Session expired" },
        { status: 401 }
      )
    }

    // Get client data
    const client = await getClientById(session.userId)

    if (!client) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "User not found" },
        { status: 401 }
      )
    }

    return NextResponse.json<AuthResponse>({
      success: true,
      user: client,
    })
  } catch (error) {
    console.error("Session error:", error)
    return NextResponse.json<AuthResponse>(
      { success: false, message: "An error occurred" },
      { status: 500 }
    )
  }
}

// DELETE /api/auth/session - Logout
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("session_token")?.value

    if (token) {
      await deleteSession(token)
    }

    const response = NextResponse.json<AuthResponse>({
      success: true,
      message: "Logged out successfully",
    })

    response.cookies.delete("session_token")

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json<AuthResponse>(
      { success: false, message: "An error occurred during logout" },
      { status: 500 }
    )
  }
}
