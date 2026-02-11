import { NextRequest, NextResponse } from "next/server"
import { getSessionByToken, updateAdminProfile, getAdminById } from "@/lib/db"
import type { AuthResponse } from "@/lib/types"

// PUT /api/admin/profile - Update admin profile
export async function PUT(request: NextRequest) {
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

    if (!session) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Session expired" },
        { status: 401 }
      )
    }

    // Get request body
    const body = await request.json()
    const { email, name, phone } = body

    // Update admin profile
    const updated = await updateAdminProfile(session.userId, {
      email,
      name,
      phone,
    })

    if (!updated) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Failed to update profile" },
        { status: 400 }
      )
    }

    // Get updated user data
    const admin = await getAdminById(session.userId)

    if (!admin) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "User not found" },
        { status: 401 }
      )
    }

    return NextResponse.json<AuthResponse>({
      success: true,
      message: "Profile updated successfully",
      user: admin,
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json<AuthResponse>(
      { success: false, message: "An error occurred" },
      { status: 500 }
    )
  }
}
