"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

const UPI_ID = "patelrudra3086@okhdfcbank"
const MERCHANT_NAME = "Rudra Patel"
const STATIC_QR_IMAGE = "/images/rudra-upi-qr.jpeg"

interface PaymentOrderResponse {
  id: string
  orderId: string
  amount: number
  status: "pending" | "verification_pending" | "paid" | "rejected"
}

interface CheckoutSession {
  cartItems: any[]
  shippingInfo: any
}

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const initializationRef = useRef(false)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [orderId, setOrderId] = useState("")
  const [amount, setAmount] = useState(0)
  const [utr, setUtr] = useState("")
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [checkoutSession, setCheckoutSession] = useState<CheckoutSession | null>(null)

  const queryAmount = useMemo(() => {
    const value = Number(searchParams.get("amount") || "0")
    if (!Number.isFinite(value) || value <= 0) return 0
    return Number(value.toFixed(2))
  }, [searchParams])

  useEffect(() => {
    // Prevent multiple initializations using ref
    if (initializationRef.current || queryAmount <= 0) return
    initializationRef.current = true

    const initPaymentOrder = async () => {
      try {
        // Retrieve checkout session from sessionStorage
        const sessionData = sessionStorage.getItem('checkoutSession')
        let session: CheckoutSession | null = null
        
        if (sessionData) {
          try {
            session = JSON.parse(sessionData)
            setCheckoutSession(session)
          } catch (e) {
            console.error('Failed to parse checkout session:', e)
          }
        }

        // Prepare payment order data with cart items and shipping info
        const paymentOrderData: any = { amount: queryAmount }
        
        if (session) {
          paymentOrderData.cartItems = session.cartItems
          paymentOrderData.shippingInfo = session.shippingInfo
        }

        const response = await fetch("/api/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentOrderData),
        })
        const result = await response.json()

        if (!result.success || !result.data) {
          throw new Error(result.error || "Failed to initialize payment")
        }

        const paymentOrder = result.data as PaymentOrderResponse
        setOrderId(paymentOrder.orderId)
        setAmount(paymentOrder.amount)
      } catch (error) {
        console.error(error)
        toast({
          title: "Payment init failed",
          description: error instanceof Error ? error.message : "Could not create payment order",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    initPaymentOrder()
  }, [queryAmount, toast])

  const upiLink = useMemo(() => {
    if (!orderId || amount <= 0) return ""
    return `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Order_${orderId}`)}`
  }, [amount, orderId])

  const downloadReceipt = (receiptStatus: PaymentOrderResponse["status"], transactionId?: string) => {
    if (!orderId || amount <= 0) return

    const generatedAt = new Date()
    const receiptHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Payment Receipt ${orderId}</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background: #f6f7fb;
        color: #111827;
        margin: 0;
        padding: 24px;
      }
      .receipt {
        max-width: 720px;
        margin: 0 auto;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 16px;
        padding: 28px;
      }
      .header {
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 16px;
        margin-bottom: 20px;
      }
      .title {
        margin: 0;
        font-size: 24px;
      }
      .subtitle {
        margin: 6px 0 0;
        color: #6b7280;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }
      .item {
        background: #f9fafb;
        border-radius: 12px;
        padding: 14px 16px;
      }
      .label {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #6b7280;
        margin-bottom: 6px;
      }
      .value {
        font-size: 16px;
        font-weight: 600;
      }
      .footer {
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid #e5e7eb;
        color: #6b7280;
        font-size: 13px;
        line-height: 1.6;
      }
    </style>
  </head>
  <body>
    <div class="receipt">
      <div class="header">
        <h1 class="title">Payment Receipt</h1>
        <p class="subtitle">Pooja Enterprise UPI payment record</p>
      </div>

      <div class="grid">
        <div class="item">
          <div class="label">Merchant Name</div>
          <div class="value">${MERCHANT_NAME}</div>
        </div>
        <div class="item">
          <div class="label">UPI ID</div>
          <div class="value">${UPI_ID}</div>
        </div>
        <div class="item">
          <div class="label">Order ID</div>
          <div class="value">${orderId}</div>
        </div>
        <div class="item">
          <div class="label">Amount</div>
          <div class="value">INR ${amount.toFixed(2)}</div>
        </div>
        <div class="item">
          <div class="label">Status</div>
          <div class="value">${receiptStatus.replace(/_/g, " ")}</div>
        </div>
        <div class="item">
          <div class="label">UTR / Transaction ID</div>
          <div class="value">${transactionId || utr.trim() || "Not submitted yet"}</div>
        </div>
        <div class="item">
          <div class="label">Generated At</div>
          <div class="value">${generatedAt.toLocaleString()}</div>
        </div>
      </div>

      <div class="footer">
        This receipt is generated from the payment details submitted on the Pooja Enterprise payment page.
        Keep this file for your records until the payment is verified by the admin team.
      </div>
    </div>
  </body>
</html>`

    const blob = new Blob([receiptHtml], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `payment-receipt-${orderId}.html`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const handleSubmitProof = async () => {
    if (!orderId) return

    if (!screenshot) {
      toast({
        title: "Payment screenshot required",
        description: "Please upload your UPI payment screenshot.",
        variant: "destructive",
      })
      return
    }

    if (!utr.trim()) {
      toast({
        title: "UPI Transaction ID required",
        description: "Please enter your UPI Transaction ID / UTR.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const formData = new FormData()
      formData.append("orderId", orderId)
      formData.append("utr", utr.trim())
      formData.append("screenshot", screenshot)

      const response = await fetch("/api/submit-proof", {
        method: "POST",
        body: formData,
      })
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to submit proof")
      }

      toast({
        title: "Order Placed Successfully!",
        description: "Your payment has been submitted for verification. You will be redirected to your orders.",
      })
      downloadReceipt("verification_pending", utr.trim())
      
      // Small delay to show the success message
      setTimeout(() => {
        router.push("/dashboard/orders")
      }, 2000)
      
      setUtr("")
      setScreenshot(null)
    } catch (error) {
      console.error(error)
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Could not submit proof",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle>UPI Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">Preparing payment...</p>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">UPI ID</p>
                  <p className="font-medium">{UPI_ID}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium">INR {amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-medium">{orderId}</p>
                </div>
              </div>

              <div className="flex justify-center">
                <img
                  src={STATIC_QR_IMAGE}
                  alt="Rudra Patel UPI QR Code"
                  className="h-auto w-full max-w-sm rounded-lg border p-2"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submit Payment Proof</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Please upload your UPI payment screenshot and enter your transaction ID to complete your order.
          </p>

          <div className="space-y-2">
            <Label htmlFor="utr">UPI Transaction ID / UTR *</Label>
            <Input
              id="utr"
              placeholder="Enter your UPI Transaction ID"
              value={utr}
              onChange={(event) => setUtr(event.target.value)}
              disabled={loading || submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="screenshot">Payment Screenshot *</Label>
            <Input
              id="screenshot"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0] || null
                setScreenshot(file)
              }}
              disabled={loading || submitting}
            />
            {screenshot && (
              <p className="text-sm text-green-600">✓ {screenshot.name}</p>
            )}
          </div>

          <Button 
            onClick={handleSubmitProof} 
            disabled={loading || submitting || !orderId || !utr.trim() || !screenshot}
            className="w-full mt-6"
            size="lg"
          >
            {submitting ? "Processing..." : "Place Order"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
