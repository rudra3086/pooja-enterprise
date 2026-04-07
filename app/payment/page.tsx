"use client"

import { useEffect, useMemo, useState } from "react"
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

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [orderId, setOrderId] = useState("")
  const [amount, setAmount] = useState(0)
  const [utr, setUtr] = useState("")
  const [screenshot, setScreenshot] = useState<File | null>(null)

  const queryAmount = useMemo(() => {
    const value = Number(searchParams.get("amount") || "0")
    if (!Number.isFinite(value) || value <= 0) return 0
    return Number(value.toFixed(2))
  }, [searchParams])

  useEffect(() => {
    const initPaymentOrder = async () => {
      if (queryAmount <= 0) {
        toast({
          title: "Invalid amount",
          description: "Please start payment from checkout.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      try {
        const response = await fetch("/api/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: queryAmount }),
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

  const handleSubmitProof = async () => {
    if (!orderId) return

    if (!utr.trim()) {
      toast({
        title: "UTR required",
        description: "Please enter transaction ID/UTR.",
        variant: "destructive",
      })
      return
    }

    if (!screenshot) {
      toast({
        title: "Screenshot required",
        description: "Please upload payment screenshot.",
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
        title: "Submitted",
        description: "Payment proof submitted for verification.",
      })
      setUtr("")
      router.push("/dashboard/orders")
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
                <div className="flex items-end">
                  <Button
                    onClick={() => {
                      if (upiLink) {
                        window.location.href = upiLink
                      }
                    }}
                    className="w-full"
                    disabled={!upiLink}
                  >
                    Pay Now
                  </Button>
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
          <div className="space-y-2">
            <Label htmlFor="utr">UTR / Transaction ID</Label>
            <Input
              id="utr"
              placeholder="Enter UTR"
              value={utr}
              onChange={(event) => setUtr(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="screenshot">Payment Screenshot</Label>
            <Input
              id="screenshot"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0] || null
                setScreenshot(file)
              }}
            />
          </div>

          <Button onClick={handleSubmitProof} disabled={loading || submitting || !orderId} className="w-full">
            {submitting ? "Submitting..." : "Submit Proof"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
