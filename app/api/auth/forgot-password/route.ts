import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { query, execute } from "@/lib/db"
import { sendEmail, getPasswordResetEmailHTML, getPasswordResetEmailText } from "@/lib/mail"
import type { ApiResponse } from "@/lib/types"
import { RowDataPacket } from "mysql2/promise"

// POST /api/auth/forgot-password - Request password reset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, userType } = body

    if (!email || !userType) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Email and user type are required" },
        { status: 400 }
      )
    }

    if (userType !== "client" && userType !== "admin") {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Invalid user type" },
        { status: 400 }
      )
    }

    // Check if user exists
    const table = userType === "client" ? "clients" : "admins"
    const rows = await query<RowDataPacket[]>(
      `SELECT id FROM ${table} WHERE email = ?`,
      [email]
    )

    if (rows.length === 0) {
      // Don't reveal if email exists or not for security
      return NextResponse.json<ApiResponse>(
        { success: true, message: "If an account exists, a reset link will be sent" },
        { status: 200 }
      )
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex")
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex")
    
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // Expires in 1 hour

    // Store reset token in database
    await execute(
      `INSERT INTO password_resets (email, user_type, token, token_hash, expires_at) 
       VALUES (?, ?, ?, ?, ?)`,
      [email, userType, token, tokenHash, expiresAt]
    )

    // In production, you would send an email here
    // For now, we'll log the reset link for testing
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const resetPath = userType === "client" ? "reset-password" : "admin/reset-password"
    const resetLink = `${baseUrl}/${resetPath}?token=${token}&email=${encodeURIComponent(email)}`

    console.log(`[DEVELOPMENT] Reset link for ${email}: ${resetLink}`)

    // Send email with reset link
    const htmlContent = getPasswordResetEmailHTML(resetLink, userType)
    const textContent = getPasswordResetEmailText(resetLink, userType)

    const emailSent = await sendEmail({
      to: email,
      subject: `Reset your ${userType === "admin" ? "Admin" : "Account"} Password - Pooja Enterprise`,
      html: htmlContent,
      text: textContent,
    })

    if (emailSent) {
      console.log(`Password reset email sent to ${email}`)
    } else {
      console.warn(`Failed to send password reset email to ${email}, but token was created`)
    }

    return NextResponse.json<ApiResponse>(
      { success: true, message: "If an account exists, a reset link will be sent" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, message: "An error occurred" },
      { status: 500 }
    )
  }
}
