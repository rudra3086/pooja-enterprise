import { NextRequest, NextResponse } from "next/server"
import { getSessionByToken, updateClientProfile, getClientById } from "@/lib/db"
import type { AuthResponse } from "@/lib/types"

// PUT /api/dashboard/profile - Update user profile
export async function PUT(request: NextRequest) {
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

    // Get request body
    const body = await request.json()
    const {
      email,
      contactPerson,
      phone,
      businessName,
      gstNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
    } = body

    // Update client profile
    const updated = await updateClientProfile(session.userId, {
      email,
      contactPerson,
      phone,
      businessName,
      gstNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
    })

    if (!updated) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Failed to update profile" },
        { status: 400 }
      )
    }

    // Get updated user data
    const client = await getClientById(session.userId)

    if (!client) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "User not found" },
        { status: 401 }
      )
    }

    return NextResponse.json<AuthResponse>({
      success: true,
      message: "Profile updated successfully",
      user: client,
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json<AuthResponse>(
      { success: false, message: "An error occurred" },
      { status: 500 }
    )
  }
}
