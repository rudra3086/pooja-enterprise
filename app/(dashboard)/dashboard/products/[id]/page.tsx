"use client"

import { useState, use } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/lib/cart-context"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Minus, Plus, ShoppingCart, Package, Check } from "lucide-react"

const products = [
  {
    id: "1",
    name: "Premium Tissue Napkins",
    category: "Tissue Napkins",
    description: "High-quality tissue napkins perfect for restaurants, hotels, and catering services. Soft, absorbent, and available in various sizes.",
    image: "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=600&h=400&fit=crop",
    basePrice: 250,
    unit: "pack of 100",
    minOrder: 10,
    stock: 500,
    features: [
      "2-ply soft tissue",
      "Food-grade quality",
      "Available in white and colored variants",
      "Custom printing available",
      "Eco-friendly options",
    ],
    sizes: ["Small (20x20cm)", "Medium (25x25cm)", "Large (30x30cm)"],
    colors: ["White", "Cream", "Light Blue", "Light Pink"],
  },
  {
    id: "2",
    name: "Tissue Rolls - Commercial",
    category: "Tissue Rolls",
    description: "Commercial-grade tissue rolls designed for high-traffic restrooms and facilities. Durable, economical, and reliable.",
    image: "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=600&h=400&fit=crop",
    basePrice: 180,
    unit: "roll",
    minOrder: 50,
    stock: 1200,
    features: [
      "Single-ply economic option",
      "High sheet count per roll",
      "Compatible with standard dispensers",
      "Bulk packaging available",
      "Cost-effective solution",
    ],
    sizes: ["Standard (100m)", "Jumbo (300m)", "Mini Jumbo (200m)"],
    colors: ["White"],
  },
  {
    id: "3",
    name: "Ultra-Soft Facial Tissue",
    category: "Ultra Soft Tissues",
    description: "Premium ultra-soft facial tissues with gentle touch. Perfect for hotels, spas, and premium establishments.",
    image: "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=600&h=400&fit=crop",
    basePrice: 320,
    unit: "box of 150",
    minOrder: 20,
    stock: 300,
    features: [
      "3-ply ultra-soft",
      "Hypoallergenic",
      "Lotion-infused options",
      "Elegant box designs",
      "Premium quality assurance",
    ],
    sizes: ["Standard Box", "Flat Box", "Cube Box"],
    colors: ["White", "With Aloe", "With Vitamin E"],
  },
  {
    id: "4",
    name: "Heavy-Duty Aluminum Foil",
    category: "Aluminum Foil",
    description: "Industrial-strength aluminum foil for commercial kitchens and food service. Superior heat resistance and durability.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
    basePrice: 450,
    unit: "roll (100m)",
    minOrder: 10,
    stock: 200,
    features: [
      "Heavy-duty thickness",
      "Superior heat resistance",
      "Food-grade certified",
      "Non-stick surface available",
      "Multiple width options",
    ],
    sizes: ["30cm width", "45cm width", "60cm width"],
    colors: ["Standard Silver"],
  },
]

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const product = products.find((p) => p.id === id) || products[0]
  const { addItem } = useCart()
  const { toast } = useToast()

  const [quantity, setQuantity] = useState(product.minOrder)
  const [selectedSize, setSelectedSize] = useState(product.sizes[0])
  const [selectedColor, setSelectedColor] = useState(product.colors[0])
  const [customization, setCustomization] = useState("")

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.basePrice,
      quantity,
      image: product.image,
      customization: {
        size: selectedSize,
        color: selectedColor,
        notes: customization,
      },
    })
    toast({
      title: "Added to Cart",
      description: `${quantity} x ${product.name} added to your cart`,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <Link
        href="/dashboard/products"
        className="inline-flex items-center text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product Image */}
        <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
          <div className="relative aspect-square">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
        </Card>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-2">
              {product.category}
            </Badge>
            <h1 className="font-serif text-3xl font-semibold text-foreground">
              {product.name}
            </h1>
            <p className="mt-4 text-muted-foreground">{product.description}</p>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-semibold text-foreground">
              Rs. {product.basePrice}
            </span>
            <span className="text-muted-foreground">/ {product.unit}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>Minimum Order: {product.minOrder} units</span>
            <span className="mx-2">|</span>
            <span
              className={
                product.stock > 100 ? "text-green-600" : "text-amber-600"
              }
            >
              {product.stock} in stock
            </span>
          </div>

          {/* Features */}
          <Card className="border-border/50 bg-secondary/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Customization Options */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Customize Your Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Size Selection */}
              <div className="space-y-2">
                <Label>Size</Label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSize(size)}
                      className={selectedSize !== size ? "bg-transparent" : ""}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="space-y-2">
                <Label>Color / Variant</Label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <Button
                      key={color}
                      variant={selectedColor === color ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedColor(color)}
                      className={selectedColor !== color ? "bg-transparent" : ""}
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label>Quantity (min. {product.minOrder})</Label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setQuantity((q) => Math.max(product.minOrder, q - 10))
                    }
                    className="bg-transparent"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.max(product.minOrder, parseInt(e.target.value) || 0)
                      )
                    }
                    className="w-24 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity((q) => q + 10)}
                    className="bg-transparent"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Custom Notes */}
              <div className="space-y-2">
                <Label>Special Requirements (Optional)</Label>
                <Textarea
                  placeholder="E.g., Custom printing, specific packaging requirements, delivery instructions..."
                  value={customization}
                  onChange={(e) => setCustomization(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Total */}
              <div className="flex items-center justify-between border-t border-border pt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-serif text-2xl font-semibold">
                    Rs. {(product.basePrice * quantity).toLocaleString()}
                  </p>
                </div>
                <Button size="lg" onClick={handleAddToCart}>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
