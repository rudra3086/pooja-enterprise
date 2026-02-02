"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Package, Minus, Plus, ShoppingCart, Palette, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useCart, type Customization } from "@/lib/cart-context"

const products = [
  {
    id: "tissue-napkin",
    name: "Tissue Napkin",
    description: "Premium quality napkins for restaurants and hotels. Available in 1-ply and 2-ply options.",
    price: 25,
    unit: "pack of 100",
    customizable: true,
    inStock: true,
  },
  {
    id: "tissue-roll",
    name: "Tissue Roll",
    description: "Soft and absorbent tissue rolls designed for commercial and industrial use.",
    price: 45,
    unit: "pack of 6",
    customizable: true,
    inStock: true,
  },
  {
    id: "ultra-soft",
    name: "Ultra Soft Tissue Napkin",
    description: "Premium ultra-soft tissues for luxury hospitality experiences.",
    price: 35,
    unit: "pack of 100",
    customizable: true,
    inStock: true,
  },
  {
    id: "aluminium-foil",
    name: "Aluminium Foil",
    description: "Food-grade aluminum foil for packaging, wrapping, and kitchen applications.",
    price: 120,
    unit: "roll (72m)",
    customizable: false,
    inStock: true,
  },
]

const logoSizes = [
  { value: "small", label: "Small (2cm)", price: 50 },
  { value: "medium", label: "Medium (4cm)", price: 100 },
  { value: "large", label: "Large (6cm)", price: 150 },
]

const logoPositions = [
  { value: "center", label: "Center", price: 0 },
  { value: "corner", label: "Corner", price: 25 },
  { value: "repeated", label: "Repeated Pattern", price: 75 },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
}

export default function DashboardProductsPage() {
  const { toast } = useToast()
  const { addItem, totalItems } = useCart()
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(products.map((p) => [p.id, 1]))
  )
  const [customizeProduct, setCustomizeProduct] = useState<typeof products[0] | null>(null)
  const [customization, setCustomization] = useState<{
    logoFile: string | null
    logoSize: "small" | "medium" | "large"
    logoPosition: "center" | "corner" | "repeated"
  }>({
    logoFile: null,
    logoSize: "small",
    logoPosition: "center",
  })

  const updateQuantity = (id: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, prev[id] + delta),
    }))
  }

  const handleAddToCart = (product: typeof products[0]) => {
    addItem({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: quantities[product.id],
      customizable: product.customizable,
    })
    toast({
      title: "Added to cart",
      description: `${quantities[product.id]} x ${product.name} added to your cart.`,
    })
    setQuantities((prev) => ({ ...prev, [product.id]: 1 }))
  }

  const calculateCustomizationCost = () => {
    const sizeCost = logoSizes.find((s) => s.value === customization.logoSize)?.price || 0
    const positionCost = logoPositions.find((p) => p.value === customization.logoPosition)?.price || 0
    return sizeCost + positionCost
  }

  const handleAddCustomizedToCart = () => {
    if (!customizeProduct) return

    const customizationData: Customization = {
      ...customization,
      additionalCost: calculateCustomizationCost(),
    }

    addItem({
      id: `${customizeProduct.id}-custom-${Date.now()}`,
      name: `${customizeProduct.name} (Customized)`,
      description: customizeProduct.description,
      price: customizeProduct.price,
      quantity: quantities[customizeProduct.id],
      customizable: true,
      customization: customizationData,
    })

    toast({
      title: "Customized product added",
      description: `${quantities[customizeProduct.id]} x ${customizeProduct.name} with custom branding added to your cart.`,
    })

    setCustomizeProduct(null)
    setCustomization({ logoFile: null, logoSize: "small", logoPosition: "center" })
    setQuantities((prev) => ({ ...prev, [customizeProduct.id]: 1 }))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="font-serif text-3xl font-semibold">Products</h1>
          <p className="mt-1 text-muted-foreground">
            Browse and order from our product catalog
          </p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <ShoppingCart className="h-4 w-4" />
          Cart ({totalItems})
        </Button>
      </motion.div>

      {/* Products Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 md:grid-cols-2"
      >
        {products.map((product) => (
          <motion.div key={product.id} variants={itemVariants}>
            <Card className="overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                {/* Product Image */}
                <div className="sm:w-1/3 aspect-square sm:aspect-auto bg-muted relative flex items-center justify-center">
                  <Package className="h-16 w-16 text-muted-foreground/30" />
                  {product.customizable && (
                    <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
                      Customizable
                    </Badge>
                  )}
                </div>

                {/* Product Info */}
                <CardContent className="flex-1 p-6">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{product.description}</p>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-2xl font-semibold">₹{product.price}</span>
                    <span className="text-sm text-muted-foreground">/ {product.unit}</span>
                  </div>

                  {/* Quantity Selector */}
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Qty:</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => updateQuantity(product.id, -1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={quantities[product.id]}
                        onChange={(e) =>
                          setQuantities((prev) => ({
                            ...prev,
                            [product.id]: Math.max(1, parseInt(e.target.value) || 1),
                          }))
                        }
                        className="w-16 h-8 text-center"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => updateQuantity(product.id, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <Button onClick={() => handleAddToCart(product)} className="flex-1 gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </Button>
                    {product.customizable && (
                      <Button
                        variant="outline"
                        onClick={() => setCustomizeProduct(product)}
                        className="gap-2"
                      >
                        <Palette className="h-4 w-4" />
                        Customize
                      </Button>
                    )}
                  </div>
                </CardContent>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Customization Modal */}
      <AnimatePresence>
        {customizeProduct && (
          <Dialog open={!!customizeProduct} onOpenChange={() => setCustomizeProduct(null)}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">
                  Customize {customizeProduct.name}
                </DialogTitle>
                <DialogDescription>
                  Add your company logo to create branded tissue products
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label>Upload Logo</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    {customization.logoFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {customization.logoFile}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setCustomization((prev) => ({ ...prev, logoFile: null }))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="cursor-pointer"
                        onClick={() =>
                          setCustomization((prev) => ({ ...prev, logoFile: "company-logo.png" }))
                        }
                      >
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, PDF up to 5MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Logo Size */}
                <div className="space-y-3">
                  <Label>Logo Size</Label>
                  <RadioGroup
                    value={customization.logoSize}
                    onValueChange={(value) =>
                      setCustomization((prev) => ({
                        ...prev,
                        logoSize: value as "small" | "medium" | "large",
                      }))
                    }
                    className="grid grid-cols-3 gap-3"
                  >
                    {logoSizes.map((size) => (
                      <div key={size.value}>
                        <RadioGroupItem
                          value={size.value}
                          id={size.value}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={size.value}
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-border bg-card p-3 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-muted"
                        >
                          <span className="text-sm font-medium">{size.label}</span>
                          <span className="text-xs text-muted-foreground">+₹{size.price}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Logo Position */}
                <div className="space-y-3">
                  <Label>Logo Position</Label>
                  <RadioGroup
                    value={customization.logoPosition}
                    onValueChange={(value) =>
                      setCustomization((prev) => ({
                        ...prev,
                        logoPosition: value as "center" | "corner" | "repeated",
                      }))
                    }
                    className="grid grid-cols-3 gap-3"
                  >
                    {logoPositions.map((position) => (
                      <div key={position.value}>
                        <RadioGroupItem
                          value={position.value}
                          id={position.value}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={position.value}
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-border bg-card p-3 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-muted"
                        >
                          <span className="text-sm font-medium">{position.label}</span>
                          {position.price > 0 && (
                            <span className="text-xs text-muted-foreground">+₹{position.price}</span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Price Summary */}
                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Base Price ({quantities[customizeProduct.id]} units)</span>
                    <span>₹{customizeProduct.price * quantities[customizeProduct.id]}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Customization Cost (per unit)</span>
                    <span>₹{calculateCustomizationCost()}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>
                      ₹
                      {(customizeProduct.price + calculateCustomizationCost()) *
                        quantities[customizeProduct.id]}
                    </span>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setCustomizeProduct(null)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCustomizedToCart} className="gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}
