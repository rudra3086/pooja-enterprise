import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { getClientByEmail, createSession } from "@/lib/db"
import type { LoginRequest, AuthResponse } from "@/lib/types"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// POST /api/auth/login - Client login
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

    // Find client by email
    const client = await getClientByEmail(email)

    if (!client) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Verify password with bcrypt
    const isValid = await bcrypt.compare(password, client.passwordHash)
    
    if (!isValid) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      )
    }

    if (client.status === "suspended") {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Your account has been suspended" },
        { status: 403 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: client.id, type: "client" },
      JWT_SECRET,
      { expiresIn: "7d" }
    )

    // Create session in database
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

    await createSession({
      userId: client.id,
      userType: "client",
      token,
      expiresAt,
      ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    })

    // Remove passwordHash from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...clientData } = client

    const response = NextResponse.json<AuthResponse>({
      success: true,
      message: "Login successful",
      user: clientData,
      token,
    })

    // Set HTTP-only cookie for session
    response.cookies.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json<AuthResponse>(
      { success: false, message: "An error occurred during login" },
      { status: 500 }
    )
  }
}
