"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Package, Minus, Plus, ShoppingCart, Palette, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
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

interface Product {
  id: string
  name: string
  description: string
  shortDescription: string
  basePrice: number
  minOrderQuantity: number
  imageUrl?: string
  isCustomizable: boolean
  customizationOptions?: {
    logoSizes?: { value: string; label: string; price: number }[]
    logoPositions?: { value: string; label: string; price: number }[]
  }
  isActive: boolean
}

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
    transition: { duration: 0.4 },
  },
}

export default function DashboardProductsPage() {
  const { toast } = useToast()
  const { addItem, totalItems } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [customizeProduct, setCustomizeProduct] = useState<Product | null>(null)
  const [customization, setCustomization] = useState<{
    logoFile: string | null
    logoSize: "small" | "medium" | "large"
    logoPosition: "center" | "corner" | "repeated"
  }>({
    logoFile: null,
    logoSize: "small",
    logoPosition: "center",
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/products?pageSize=100")
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data.data) {
          const productData = result.data.data.filter((p: Product) => p.isActive)
          setProducts(productData)
          // Initialize quantities
          const initialQuantities: Record<string, number> = {}
          productData.forEach((p: Product) => {
            initialQuantities[p.id] = 1
          })
          setQuantities(initialQuantities)
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = (id: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, prev[id] + delta),
    }))
  }

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      description: product.description,
      price: product.basePrice,
      image: product.imageUrl,
      quantity: quantities[product.id],
      customizable: product.isCustomizable,
    })
    toast({
      title: "Added to cart",
      description: `${quantities[product.id]} x ${product.name} added to your cart.`,
    })
    setQuantities((prev) => ({ ...prev, [product.id]: 1 }))
  }

  // Fetch fresh product data when user clicks customize
  const handleCustomizeClick = async (product: Product) => {
    try {
      const response = await fetch(`/api/products/${product.id}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          // Set the fresh product data with updated customization options
          setCustomizeProduct(result.data)
        } else {
          // Fallback to the product from list if API fails
          setCustomizeProduct(product)
        }
      } else {
        // Fallback to the product from list if API fails
        setCustomizeProduct(product)
      }
    } catch (error) {
      console.error("Error fetching product for customization:", error)
      // Fallback to the product from list if API fails
      setCustomizeProduct(product)
    }
  }

  const handleLogoFileSelect = async (file: File) => {
    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload PNG, JPG, or PDF files only",
        variant: "destructive",
      })
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    // Convert to data URL
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setCustomization((prev) => ({ ...prev, logoFile: dataUrl }))
      toast({
        title: "Logo uploaded",
        description: file.name,
      })
    }
    reader.onerror = () => {
      toast({
        title: "Error uploading file",
        description: "Failed to read the file",
        variant: "destructive",
      })
    }
    reader.readAsDataURL(file)
  }

  const handleLogoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleLogoFileSelect(file)
    }
  }

  const handleLogoDragAndDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleLogoFileSelect(file)
    }
  }

  const calculateCustomizationCost = () => {
    if (!customizeProduct?.customizationOptions) return 0
    
    // Default values if not set in database
    const defaultLogoSizes = [
      { value: "small", label: "Small (2cm)", price: 50 },
      { value: "medium", label: "Medium (4cm)", price: 100 },
      { value: "large", label: "Large (6cm)", price: 150 },
    ]
    const defaultLogoPositions = [
      { value: "center", label: "Center", price: 0 },
      { value: "corner", label: "Corner", price: 25 },
      { value: "repeated", label: "Repeated Pattern", price: 75 },
    ]
    
    const logoSizes = customizeProduct.customizationOptions.logoSizes || defaultLogoSizes
    const logoPositions = customizeProduct.customizationOptions.logoPositions || defaultLogoPositions
    
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
      productId: customizeProduct.id,
      name: `${customizeProduct.name} (Customized)`,
      description: customizeProduct.description,
      price: customizeProduct.basePrice,
      image: customizeProduct.imageUrl,
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
        <Link href="/dashboard/cart">
          <Button variant="outline" className="gap-2 bg-transparent">
            <ShoppingCart className="h-4 w-4" />
            Cart ({totalItems})
          </Button>
        </Link>
      </motion.div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden h-full p-0">
              <div className="flex flex-col sm:flex-row h-full">
                <div className="sm:w-1/3 min-h-[250px] sm:min-h-full bg-muted">
                  <Skeleton className="h-full w-full" />
                </div>
                <CardContent className="flex-1 p-6">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="mt-2 h-4 w-full" />
                  <Skeleton className="mt-4 h-8 w-24" />
                  <Skeleton className="mt-4 h-8 w-32" />
                  <Skeleton className="mt-4 h-10 w-full" />
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      ) : (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 md:grid-cols-2"
      >
        {products.map((product) => (
          <motion.div key={product.id} variants={itemVariants}>
            <Card className="overflow-hidden h-full p-0">
              <div className="flex flex-col sm:flex-row h-full">
                {/* Product Image */}
                <div className="sm:w-1/3 min-h-[250px] sm:min-h-full bg-muted relative overflow-hidden shrink-0">
                  <Image
                    src={product.imageUrl || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  {product.isCustomizable && (
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
                    <span className="text-2xl font-semibold">₹{product.basePrice.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground">/ pack of {product.minOrderQuantity}</span>
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
                    {product.isCustomizable && (
                      <Button
                        variant="outline"
                        onClick={() => handleCustomizeClick(product)}
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
      )}

      {/* Customization Modal */}
      <AnimatePresence>
        {customizeProduct && (() => {
          // Default values if not set in database
          const defaultLogoSizes = [
            { value: "small", label: "Small (2cm)", price: 50 },
            { value: "medium", label: "Medium (4cm)", price: 100 },
            { value: "large", label: "Large (6cm)", price: 150 },
          ]
          const defaultLogoPositions = [
            { value: "center", label: "Center", price: 0 },
            { value: "corner", label: "Corner", price: 25 },
            { value: "repeated", label: "Repeated Pattern", price: 75 },
          ]
          
          const logoSizes = customizeProduct.customizationOptions?.logoSizes || defaultLogoSizes
          const logoPositions = customizeProduct.customizationOptions?.logoPositions || defaultLogoPositions
          
          return (
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
                  <input
                    ref={(input) => {
                      if (input && !input.dataset.logoInput) {
                        input.dataset.logoInput = "true"
                      }
                    }}
                    id="logo-input"
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf"
                    className="hidden"
                    onChange={handleLogoInputChange}
                  />
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center transition-colors hover:border-primary hover:bg-muted/50"
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onDrop={handleLogoDragAndDrop}
                  >
                    {customization.logoFile ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center">
                          <img
                            src={customization.logoFile}
                            alt="Uploaded logo"
                            className="max-h-32 max-w-32 rounded"
                          />
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm text-muted-foreground">Logo uploaded</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setCustomization((prev) => ({ ...prev, logoFile: null }))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById("logo-input")?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Change Logo
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="cursor-pointer"
                        onClick={() => document.getElementById("logo-input")?.click()}
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
                    <span>₹{(customizeProduct.basePrice * quantities[customizeProduct.id]).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Customization Cost (per unit)</span>
                    <span>₹{calculateCustomizationCost()}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>
                      ₹
                      {((customizeProduct.basePrice + calculateCustomizationCost()) *
                        quantities[customizeProduct.id]).toFixed(2)}
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
          )
        })()}
      </AnimatePresence>
    </div>
  )
}
