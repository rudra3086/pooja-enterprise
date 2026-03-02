import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getClientByEmail, createClient, getClientById } from "@/lib/db"
import type { RegisterRequest, AuthResponse } from "@/lib/types"
import {
  sanitizeInput,
  isValidEmail,
  isValidPhone,
  isValidIndianGstNumber,
  normalizePhone,
} from "@/lib/validation"

// POST /api/auth/register - Client registration
export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json()
    const email = sanitizeInput(body.email).toLowerCase()
    const password = body.password
    const businessName = sanitizeInput(body.businessName)
    const contactPerson = sanitizeInput(body.contactPerson)
    const phone = sanitizeInput(body.phone)
    const gstNumber = sanitizeInput(body.gstNumber)

    // Validate required fields
    if (!email || !password || !businessName || !contactPerson || !phone) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "All required fields must be provided" },
        { status: 400 }
      )
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      )
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Invalid phone number. Use 10 to 15 digits" },
        { status: 400 }
      )
    }

    if (gstNumber && !isValidIndianGstNumber(gstNumber)) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Invalid GST number format" },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Password must be at least 8 characters long" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingClient = await getClientByEmail(email)
    if (existingClient) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "An account with this email already exists" },
        { status: 409 }
      )
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 10)

    // Create new client in database
    const clientId = await createClient({
      email,
      passwordHash,
      businessName,
      contactPerson,
      phone: normalizePhone(phone),
      gstNumber: gstNumber || undefined,
    })

    // Fetch the created client
    const newClient = await getClientById(clientId)

    return NextResponse.json<AuthResponse>({
      success: true,
      message: "Registration successful. Your account is pending approval.",
      user: newClient || undefined,
    }, { status: 201 })

  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json<AuthResponse>(
      { success: false, message: "An error occurred during registration" },
      { status: 500 }
    )
  }
}
