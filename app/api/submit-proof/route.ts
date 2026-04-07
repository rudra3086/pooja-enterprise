import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { NextRequest, NextResponse } from "next/server"
import { getSessionByToken, submitPaymentProof } from "@/lib/db"
import type { ApiResponse } from "@/lib/types"

async function getClientIdFromRequest(request: NextRequest): Promise<string | undefined> {
  const token = request.cookies.get("session_token")?.value
  if (!token) return undefined

  const session = await getSessionByToken(token)
  if (!session || session.userType !== "client") return undefined

  return session.userId
}

function getSafeExtension(filename: string): string {
  const ext = path.extname(filename || "").toLowerCase()
  if ([".png", ".jpg", ".jpeg", ".webp"].includes(ext)) {
    return ext
  }
  return ".png"
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const orderId = String(formData.get("orderId") || "").trim()
    const utr = String(formData.get("utr") || "").trim()
    const screenshot = formData.get("screenshot")

    if (!orderId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "orderId is required" },
        { status: 400 }
      )
    }

    if (!utr) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "UTR is required" },
        { status: 400 }
      )
    }

    if (!(screenshot instanceof File) || screenshot.size <= 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Payment screenshot is required" },
        { status: 400 }
      )
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "payment-proofs")
    await mkdir(uploadDir, { recursive: true })

    const ext = getSafeExtension(screenshot.name)
    const filename = `${orderId}-${Date.now()}${ext}`
    const savePath = path.join(uploadDir, filename)

    const bytes = await screenshot.arrayBuffer()
    await writeFile(savePath, Buffer.from(bytes))

    const screenshotUrl = `/uploads/payment-proofs/${filename}`

    const updated = await submitPaymentProof({
      orderId,
      utr,
      screenshotUrl,
      clientId: await getClientIdFromRequest(request),
    })

    if (!updated) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Payment order not found" },
        { status: 404 }
      )
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Payment proof submitted successfully",
    })
  } catch (error) {
    console.error("Submit payment proof error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to submit payment proof" },
      { status: 500 }
    )
  }
}
