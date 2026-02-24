import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import bcrypt from "bcryptjs"
import { query, execute } from "@/lib/db"
import type { ApiResponse } from "@/lib/types"
import { RowDataPacket } from "mysql2/promise"

// POST /api/auth/reset-password - Reset password with token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, email, password, userType = "client" } = body

    if (!token || !email || !password) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Token, email, and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Password must be at least 8 characters long" },
        { status: 400 }
      )
    }

    // Hash the provided token
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex")

    // Find the reset token
    const resetRows = await query<RowDataPacket[]>(
      `SELECT * FROM password_resets 
       WHERE email = ? AND user_type = ? AND token_hash = ? AND is_used = FALSE`,
      [email, userType, tokenHash]
    )

    if (resetRows.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Invalid or expired reset token" },
        { status: 401 }
      )
    }

    const resetRecord = resetRows[0]

    // Check if token has expired
    const now = new Date()
    const expiresAt = new Date(resetRecord.expires_at)

    if (now > expiresAt) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Reset token has expired" },
        { status: 401 }
      )
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, 10)

    // Update user's password
    const table = userType === "client" ? "clients" : "admins"
    await execute(
      `UPDATE ${table} SET password_hash = ? WHERE email = ?`,
      [passwordHash, email]
    )

    // Mark reset token as used
    await execute(
      `UPDATE password_resets SET is_used = TRUE WHERE id = ?`,
      [resetRecord.id]
    )

    return NextResponse.json<ApiResponse>(
      { success: true, message: "Password has been reset successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, message: "An error occurred while resetting password" },
      { status: 500 }
    )
  }
}
