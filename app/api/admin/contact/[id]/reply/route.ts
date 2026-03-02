import { NextRequest, NextResponse } from "next/server"
import { getSessionByToken, getContactMessageById, replyToContactMessage } from "@/lib/db"
import { sendEmailDetailed } from "@/lib/mail"
import { sanitizeInput } from "@/lib/validation"
import type { ApiResponse, ContactMessage } from "@/lib/types"

async function getAdminSession(request: NextRequest): Promise<{ userId: string } | null> {
  const token = request.cookies.get("admin_session_token")?.value
  if (!token) return null

  const session = await getSessionByToken(token)
  if (!session || session.userType !== "admin") return null

  return { userId: session.userId }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = await getAdminSession(request)
    if (!adminSession) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Admin authentication required" },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const reply = sanitizeInput(body.reply)

    if (!reply) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Reply message is required" },
        { status: 400 }
      )
    }

    const contactMessage = await getContactMessageById(id)
    if (!contactMessage) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Message not found" },
        { status: 404 }
      )
    }

    const emailResult = await sendEmailDetailed({
      to: contactMessage.email,
      subject: `Re: ${contactMessage.subject}`,
      html: `
        <p>Hello ${contactMessage.name},</p>
        <p>Thank you for contacting Pooja Enterprise.</p>
        <p>${reply.replace(/\n/g, "<br />")}</p>
        <br />
        <p>Regards,<br />Pooja Enterprise Team</p>
      `,
      text: `Hello ${contactMessage.name},\n\nThank you for contacting Pooja Enterprise.\n\n${reply}\n\nRegards,\nPooja Enterprise Team`,
    })

    if (!emailResult.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: emailResult.error || "Failed to send email reply" },
        { status: 500 }
      )
    }

    const updated = await replyToContactMessage(id, reply, adminSession.userId)
    if (!updated) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Reply sent but failed to update message status" },
        { status: 500 }
      )
    }

    return NextResponse.json<ApiResponse<ContactMessage>>({
      success: true,
      data: updated,
      message: "Reply sent successfully",
    })
  } catch (error) {
    console.error("Admin reply contact message error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to send reply" },
      { status: 500 }
    )
  }
}
