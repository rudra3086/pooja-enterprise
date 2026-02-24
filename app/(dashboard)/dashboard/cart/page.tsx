"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ShoppingCart, Minus, Plus, Trash2, Package, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-context"

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, clearCart } = useCart()
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
        >
          <h1 className="font-serif text-3xl font-semibold">Shopping Cart</h1>
          <p className="mt-1 text-muted-foreground">
            Review and manage items in your cart
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
            <ShoppingCart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="mt-4 font-semibold text-lg">Your cart is empty</h2>
          <p className="mt-1 text-muted-foreground">
            Add products to your cart to get started
          </p>
          <Link href="/dashboard/products" className="mt-6">
            <Button className="gap-2">
              <Package className="h-4 w-4" />
              Browse Products
            </Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="font-serif text-3xl font-semibold">Shopping Cart</h1>
          <p className="mt-1 text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={clearCart}>
          Clear Cart
        </Button>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-2 space-y-4"
        >
          {items.map((item, index) => (
            <Card key={`${item.id}-${index}`}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <div className="w-full sm:w-24 h-24 rounded-lg bg-muted relative overflow-hidden shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <Package className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Customization Badge */}
                    {item.customization && (
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">
                          Logo: {item.customization.logoSize} - {item.customization.logoPosition}
                        </Badge>
                        <Badge variant="outline">
                          +₹{item.customization.additionalCost}/unit
                        </Badge>
                      </div>
                    )}

                    {/* Price and Quantity */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-transparent"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-transparent"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          ₹{(item.price + (item.customization?.additionalCost || 0)) * item.quantity}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ₹{item.price + (item.customization?.additionalCost || 0)} each
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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

              <Link href="/dashboard/checkout" className="block">
                <Button className="w-full gap-2 group">
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>

              <Link href="/dashboard/products" className="block">
                <Button variant="outline" className="w-full bg-transparent">
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
