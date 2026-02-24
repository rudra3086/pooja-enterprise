"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { CreditCard, Building2, Truck, ArrowLeft, CheckCircle, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-context"
import { useToast } from "@/hooks/use-toast"

const paymentMethods = [
  { id: "bank_transfer", label: "Bank Transfer", description: "Direct bank transfer (NEFT/RTGS)" },
  { id: "upi", label: "UPI", description: "Pay using UPI apps" },
  { id: "credit_terms", label: "Credit Terms", description: "Business credit (eligible clients only)" },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { items, totalPrice, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "upi" | "credit_terms">("bank_transfer")
  const [shippingInfo, setShippingInfo] = useState({
    name: "Business Name / Contact Person",
    address: "123 Business Park, Industrial Area",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    phone: "+91 98765 43210",
    notes: "",
  })

  useEffect(() => {
    // Try to get user info from session to pre-fill
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session")
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            setShippingInfo(prev => ({
              ...prev,
              name: data.user.contactPerson || data.user.businessName || prev.name,
              address: data.user.addressLine1 || prev.address,
              city: data.user.city || prev.city,
              state: data.user.state || prev.state,
              pincode: data.user.postalCode || prev.pincode,
              phone: data.user.phone || prev.phone,
            }))
          }
        }
      } catch (err) {
        console.error("Failed to fetch session:", err)
      }
    }
    fetchSession()
  }, [])

  const gst = Math.round(totalPrice * 0.18)
  const shippingAmount = totalPrice > 10000 ? 0 : 500
  const grandTotal = totalPrice + gst + shippingAmount

  if (items.length === 0) {
    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
            <Package className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="mt-4 font-semibold text-lg">No items to checkout</h2>
          <p className="mt-1 text-muted-foreground">
            Add products to your cart first
          </p>
          <Link href="/dashboard/products" className="mt-6">
            <Button>Browse Products</Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  const handlePlaceOrder = async () => {
    setIsProcessing(true)

    try {
      const orderData = {
        shippingName: shippingInfo.name,
        shippingPhone: shippingInfo.phone,
        shippingAddressLine1: shippingInfo.address,
        shippingCity: shippingInfo.city,
        shippingState: shippingInfo.state,
        shippingPostalCode: shippingInfo.pincode,
        paymentMethod: paymentMethod,
        customerNotes: shippingInfo.notes,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          customization: item.customization || undefined,
        })),
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Order placed successfully!",
          description: "Your order has been confirmed and saved to your account.",
        })
        clearCart()
        router.push("/dashboard/orders")
      } else {
        console.error("Order creation failed:", result)
        toast({
          title: "Failed to place order",
          description: result.error || "An error occurred. Please try again.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Place order error:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-4"
      >
        <Link href="/dashboard/cart">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="font-serif text-3xl font-semibold">Checkout</h1>
          <p className="mt-1 text-muted-foreground">
            Complete your order
          </p>
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Checkout Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Business / Contact Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your business or personal name"
                  value={shippingInfo.name}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Textarea
                  id="address"
                  value={shippingInfo.address}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={shippingInfo.city}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={shippingInfo.state}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={shippingInfo.pincode}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, pincode: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Order Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special instructions for delivery..."
                  value={shippingInfo.notes}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, notes: e.target.value })}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-start space-x-3 py-3">
                    <RadioGroupItem value={method.id} id={method.id} className="mt-0.5" />
                    <Label htmlFor={method.id} className="flex flex-col cursor-pointer">
                      <span className="font-medium">{method.label}</span>
                      <span className="text-sm text-muted-foreground">{method.description}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {(paymentMethod === "bank_transfer" || paymentMethod === "upi") && (
                <div className="mt-4 p-4 rounded-lg bg-muted text-sm">
                  <p className="font-medium">Payment Details:</p>
                  {paymentMethod === "bank_transfer" ? (
                    <p className="mt-2 text-muted-foreground">
                      Account Name: Pooja Enterprise<br />
                      Account Number: 1234567890<br />
                      IFSC Code: HDFC0001234<br />
                      Bank: HDFC Bank
                    </p>
                  ) : (
                    <p className="mt-2 text-muted-foreground">
                      UPI ID: pooja.enterprise@upi<br />
                      Merchant Name: Pooja Enterprise
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={`${item.id}-${index}`} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.name} x {item.quantity}
                    {item.customization && " (Customized)"}
                  </span>
                  <span>
                    ₹{(item.price + (item.customization?.additionalCost || 0)) * item.quantity}
                  </span>
                </div>
              ))}

              <Separator />

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{totalPrice}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST (18%)</span>
                <span>₹{gst}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className={shippingAmount === 0 ? "text-green-600" : "text-foreground"}>
                  {shippingAmount === 0 ? "Free" : `₹${shippingAmount}`}
                </span>
              </div>

              <Separator />

              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>₹{grandTotal}</span>
              </div>

              <Button
                className="w-full gap-2"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  "Processing..."
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Place Order
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By placing this order, you agree to our Terms of Service and Privacy Policy
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
