import { NextRequest, NextResponse } from "next/server"
import { createContactMessage } from "@/lib/db"
import { sendEmail } from "@/lib/mail"
import { sanitizeInput, isValidEmail, isValidPhone, normalizePhone } from "@/lib/validation"
import type { ApiResponse } from "@/lib/types"

interface ContactRequest {
  name: string
  email: string
  company?: string
  phone?: string
  subject?: string
  message: string
}

// POST /api/contact - Submit contact form
export async function POST(request: NextRequest) {
  try {
    const body: ContactRequest = await request.json()
    const name = sanitizeInput(body.name)
    const email = sanitizeInput(body.email).toLowerCase()
    const company = sanitizeInput(body.company)
    const phone = sanitizeInput(body.phone)
    const subject = sanitizeInput(body.subject) || "Website Inquiry"
    const message = sanitizeInput(body.message)

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "All required fields must be provided" },
        { status: 400 }
      )
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      )
    }

    if (phone && !isValidPhone(phone)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid phone number. Use 10 to 15 digits" },
        { status: 400 }
      )
    }

    await createContactMessage({
      name,
      email,
      company: company || undefined,
      phone: phone ? normalizePhone(phone) : undefined,
      subject,
      message,
    })

    const notifyTo = process.env.CONTACT_NOTIFY_EMAIL || process.env.MAIL_FROM
    if (notifyTo) {
      await sendEmail({
        to: notifyTo,
        subject: `New Contact Message: ${subject}`,
        html: `
          <h2>New Contact Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Company:</strong> ${company || "-"}</p>
          <p><strong>Phone:</strong> ${phone || "-"}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br />")}</p>
        `,
        text: `New Contact Message\n\nName: ${name}\nEmail: ${email}\nCompany: ${company || "-"}\nPhone: ${phone || "-"}\nSubject: ${subject}\n\n${message}`,
      })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Thank you for your message. We will get back to you within 24 hours.",
    })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to submit contact form" },
      { status: 500 }
    )
  }
}
