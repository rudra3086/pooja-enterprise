import { NextRequest, NextResponse } from "next/server"
import { getSessionByToken, updateClientProfile, getClientById, getClientByEmail } from "@/lib/db"
import type { AuthResponse } from "@/lib/types"
import {
  sanitizeInput,
  isValidEmail,
  isValidPhone,
  isValidIndianGstNumber,
  isValidPostalCode,
  normalizePhone,
} from "@/lib/validation"

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

    const sanitizedEmail = email !== undefined ? sanitizeInput(email).toLowerCase() : undefined
    const sanitizedPhone = phone !== undefined ? sanitizeInput(phone) : undefined
    const sanitizedGstNumber = gstNumber !== undefined ? sanitizeInput(gstNumber) : undefined
    const sanitizedAddressLine1 = addressLine1 !== undefined ? sanitizeInput(addressLine1) : undefined
    const sanitizedAddressLine2 = addressLine2 !== undefined ? sanitizeInput(addressLine2) : undefined
    const sanitizedCity = city !== undefined ? sanitizeInput(city) : undefined
    const sanitizedState = state !== undefined ? sanitizeInput(state) : undefined
    const sanitizedPostalCode = postalCode !== undefined ? sanitizeInput(postalCode) : undefined
    const sanitizedCountry = country !== undefined ? sanitizeInput(country) : undefined
    const sanitizedContactPerson = contactPerson !== undefined ? sanitizeInput(contactPerson) : undefined
    const sanitizedBusinessName = businessName !== undefined ? sanitizeInput(businessName) : undefined

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

    if (sanitizedGstNumber !== undefined && sanitizedGstNumber !== "" && !isValidIndianGstNumber(sanitizedGstNumber)) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Invalid GST number format" },
        { status: 400 }
      )
    }

    if (sanitizedPostalCode !== undefined && sanitizedPostalCode !== "" && !isValidPostalCode(sanitizedPostalCode)) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Invalid postal code. Use 6 digits" },
        { status: 400 }
      )
    }

    if (sanitizedAddressLine1 !== undefined && sanitizedAddressLine1 !== "" && sanitizedAddressLine1.length < 5) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Address must be at least 5 characters" },
        { status: 400 }
      )
    }

    if (sanitizedEmail !== undefined) {
      const existingClient = await getClientByEmail(sanitizedEmail)
      if (existingClient && existingClient.id !== session.userId) {
        return NextResponse.json<AuthResponse>(
          { success: false, message: "Email already in use by another account" },
          { status: 409 }
        )
      }
    }

    // Update client profile
    const updated = await updateClientProfile(session.userId, {
      email: sanitizedEmail,
      contactPerson: sanitizedContactPerson,
      phone: sanitizedPhone !== undefined ? normalizePhone(sanitizedPhone) : undefined,
      businessName: sanitizedBusinessName,
      gstNumber: sanitizedGstNumber,
      addressLine1: sanitizedAddressLine1,
      addressLine2: sanitizedAddressLine2,
      city: sanitizedCity,
      state: sanitizedState,
      postalCode: sanitizedPostalCode,
      country: sanitizedCountry,
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
