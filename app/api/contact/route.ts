import { NextRequest, NextResponse } from "next/server"
import type { ApiResponse } from "@/lib/types"

interface ContactRequest {
  name: string
  email: string
  company?: string
  phone?: string
  subject: string
  message: string
}

// POST /api/contact - Submit contact form
export async function POST(request: NextRequest) {
  try {
    const body: ContactRequest = await request.json()
    const { name, email, subject, message, company, phone } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "All required fields must be provided" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      )
    }

    // In production: Save to database and/or send email notification
    // await db.query('INSERT INTO contact_messages (...) VALUES (...)')
    // await sendEmail({ to: 'sales@poojaenterprise.com', subject: `Contact Form: ${subject}`, ... })

    console.log("Contact form submission:", { name, email, company, phone, subject, message })

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Thank you for your message. We will get back to you within 24-48 hours.",
    })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to submit contact form" },
      { status: 500 }
    )
  }
}
