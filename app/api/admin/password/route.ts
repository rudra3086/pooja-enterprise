import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getSessionByToken, execute } from "@/lib/db"
import type { AuthResponse, Admin } from "@/lib/types"

// Helper to get admin with password hash
async function getAdminWithPassword(id: string): Promise<(Admin & { passwordHash: string }) | null> {
  const { query } = await import("@/lib/db")
  const rows = await query(
    `SELECT 
      id, email, name, phone, password_hash as passwordHash, role, avatar_url as avatarUrl,
      is_active as isActive, last_login as lastLogin,
      created_at as createdAt, updated_at as updatedAt
    FROM admins 
    WHERE id = ?`,
    [id]
  )
  if (rows.length === 0) return null
  const row = rows[0]
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    passwordHash: row.passwordHash,
    role: row.role,
    avatarUrl: row.avatarUrl,
    isActive: Boolean(row.isActive),
    lastLogin: row.lastLogin,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

// PUT /api/admin/password - Change admin password
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_session_token")?.value

    if (!token) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      )
    }

    // Validate token and get session
    const session = await getSessionByToken(token)

    if (!session || session.userType !== "admin") {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Session expired" },
        { status: 401 }
      )
    }

    // Get request body
    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Current and new passwords are required" },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "New password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Get admin record with password hash
    const admin = await getAdminWithPassword(session.userId)

    if (!admin) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Admin not found" },
        { status: 404 }
      )
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, admin.passwordHash)

    if (!isValid) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Current password is incorrect" },
        { status: 401 }
      )
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    // Update password in database
    await execute(
      "UPDATE admins SET password_hash = ? WHERE id = ?",
      [newPasswordHash, admin.id]
    )

    return NextResponse.json<AuthResponse>({
      success: true,
      message: "Password updated successfully",
    })
  } catch (error) {
    console.error("Password change error:", error)
    return NextResponse.json<AuthResponse>(
      { success: false, message: "An error occurred while changing password" },
      { status: 500 }
    )
  }
}
