import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { getAdminByEmail, createSession, updateAdminLastLogin } from "@/lib/db"
import type { LoginRequest, AuthResponse } from "@/lib/types"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// POST /api/admin/auth/login - Admin login
export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      )
    }

    // Find admin by email
    const admin = await getAdminByEmail(email)

    if (!admin) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      )
    }

    if (!admin.isActive) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Your account has been deactivated" },
        { status: 403 }
      )
    }

    // Verify password with bcrypt
    const isValid = await bcrypt.compare(password, admin.passwordHash)
    
    if (!isValid) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: admin.id, type: "admin", role: admin.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    )

    // Create session in database
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24 hours for admin

    await createSession({
      userId: admin.id,
      userType: "admin",
      token,
      expiresAt,
      ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    })

    // Update last login
    await updateAdminLastLogin(admin.id)

    // Remove passwordHash from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...adminData } = admin

    const response = NextResponse.json<AuthResponse>({
      success: true,
      message: "Login successful",
      user: adminData,
      token,
    })

    // Set HTTP-only cookie for admin session
    response.cookies.set("admin_session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours (shorter for admin)
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json<AuthResponse>(
      { success: false, message: "An error occurred during login" },
      { status: 500 }
    )
  }
}
