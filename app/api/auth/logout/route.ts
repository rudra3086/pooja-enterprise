import { NextResponse } from "next/server"
import type { AuthResponse } from "@/lib/types"

// POST /api/auth/logout - Logout user
export async function POST() {
  try {
    // In production: Delete session from database
    // await db.query('DELETE FROM sessions WHERE token = ?', [token])

    const response = NextResponse.json<AuthResponse>({
      success: true,
      message: "Logged out successfully",
    })

    // Clear session cookie
    response.cookies.set("session_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json<AuthResponse>(
      { success: false, message: "An error occurred during logout" },
      { status: 500 }
    )
  }
}
