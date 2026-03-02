import { NextRequest, NextResponse } from "next/server"
import { getSessionByToken, updateAdminProfile, getAdminById, getAdminByEmail } from "@/lib/db"
import type { AuthResponse } from "@/lib/types"
import { sanitizeInput, isValidEmail, isValidPhone, normalizePhone } from "@/lib/validation"

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

    const sanitizedEmail = email !== undefined ? sanitizeInput(email).toLowerCase() : undefined
    const sanitizedName = name !== undefined ? sanitizeInput(name) : undefined
    const sanitizedPhone = phone !== undefined ? sanitizeInput(phone) : undefined

    if (sanitizedEmail !== undefined && !isValidEmail(sanitizedEmail)) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      )
    }

    if (sanitizedPhone !== undefined && !isValidPhone(sanitizedPhone)) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Invalid phone number. Use 10 to 15 digits" },
        { status: 400 }
      )
    }

    if (sanitizedEmail !== undefined) {
      const existingAdmin = await getAdminByEmail(sanitizedEmail)
      if (existingAdmin && existingAdmin.id !== session.userId) {
        return NextResponse.json<AuthResponse>(
          { success: false, message: "Email already in use by another admin" },
          { status: 409 }
        )
      }
    }

    // Update admin profile
    const updated = await updateAdminProfile(session.userId, {
      email: sanitizedEmail,
      name: sanitizedName,
      phone: sanitizedPhone !== undefined ? normalizePhone(sanitizedPhone) : undefined,
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
