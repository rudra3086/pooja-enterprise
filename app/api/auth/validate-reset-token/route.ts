import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { query } from "@/lib/db"
import type { ApiResponse } from "@/lib/types"
import { RowDataPacket } from "mysql2/promise"

// POST /api/auth/validate-reset-token - Validate password reset token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, email, userType = "client" } = body

    if (!token || !email) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Token and email are required" },
        { status: 400 }
      )
    }

    // Hash the provided token
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex")

    // Find the reset token
    const rows = await query<RowDataPacket[]>(
      `SELECT * FROM password_resets 
       WHERE email = ? AND user_type = ? AND token_hash = ? AND is_used = FALSE`,
      [email, userType, tokenHash]
    )

    if (rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Invalid or expired reset token" },
        { status: 401 }
      )
    }

    const resetRecord = rows[0]

    // Check if token has expired
    const now = new Date()
    const expiresAt = new Date(resetRecord.expires_at)

    if (now > expiresAt) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Reset token has expired" },
        { status: 401 }
      )
    }

    return NextResponse.json<ApiResponse>(
      { success: true, message: "Token is valid" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Token validation error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, message: "An error occurred" },
      { status: 500 }
    )
  }
}
