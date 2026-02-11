"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Package, Save, X, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface Product {
  id: string
  categoryId: string
  name: string
  slug: string
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
  isFeatured: boolean
  createdAt: Date
  updatedAt: Date
}

export default function AdminProductsPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    shortDescription: "",
    basePrice: 0,
    minOrderQuantity: 0,
    isActive: true,
    isFeatured: false,
    isCustomizable: false,
    logoSizeSmallPrice: 50,
    logoSizeMediumPrice: 100,
    logoSizeLargePrice: 150,
    logoPositionCenterPrice: 0,
    logoPositionCornerPrice: 25,
    logoPositionRepeatedPrice: 75,
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products)
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

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    const customOpts = product.customizationOptions
    setFormData({
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription,
      basePrice: product.basePrice,
      minOrderQuantity: product.minOrderQuantity,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      isCustomizable: product.isCustomizable,
      logoSizeSmallPrice: customOpts?.logoSizes?.find(s => s.value === 'small')?.price ?? 50,
      logoSizeMediumPrice: customOpts?.logoSizes?.find(s => s.value === 'medium')?.price ?? 100,
      logoSizeLargePrice: customOpts?.logoSizes?.find(s => s.value === 'large')?.price ?? 150,
      logoPositionCenterPrice: customOpts?.logoPositions?.find(p => p.value === 'center')?.price ?? 0,
      logoPositionCornerPrice: customOpts?.logoPositions?.find(p => p.value === 'corner')?.price ?? 25,
      logoPositionRepeatedPrice: customOpts?.logoPositions?.find(p => p.value === 'repeated')?.price ?? 75,
    })
  }

  const handleSave = async () => {
    if (!editingProduct) return

    try {
      const customizationOptions = formData.isCustomizable ? {
        logoSizes: [
          { value: 'small', label: 'Small (2cm)', price: formData.logoSizeSmallPrice },
          { value: 'medium', label: 'Medium (4cm)', price: formData.logoSizeMediumPrice },
          { value: 'large', label: 'Large (6cm)', price: formData.logoSizeLargePrice },
        ],
        logoPositions: [
          { value: 'center', label: 'Center', price: formData.logoPositionCenterPrice },
          { value: 'corner', label: 'Corner', price: formData.logoPositionCornerPrice },
          { value: 'repeated', label: 'Repeated Pattern', price: formData.logoPositionRepeatedPrice },
        ]
      } : null

      const response = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: editingProduct.id,
          name: formData.name,
          description: formData.description,
          shortDescription: formData.shortDescription,
          basePrice: formData.basePrice,
          minOrderQuantity: formData.minOrderQuantity,
          isActive: formData.isActive,
          isFeatured: formData.isFeatured,
          isCustomizable: formData.isCustomizable,
          customizationOptions: customizationOptions,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Product updated successfully",
        })
        setEditingProduct(null)
        fetchProducts()
      } else {
        toast({
          title: "Error",
          description: "Failed to update product",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-semibold">Products Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage product information, pricing, and availability
        </p>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden relative">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Package className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl">{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {product.shortDescription}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Base Price</Label>
                    <p className="text-lg font-semibold">₹{product.basePrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Min Order Qty</Label>
                    <p className="text-lg font-semibold">{product.minOrderQuantity}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {product.isActive ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {product.isFeatured && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      Featured
                    </span>
                  )}
                  {product.isCustomizable && (
                    <span className="text-xs bg-accent/50 text-accent-foreground px-2 py-1 rounded">
                      Customizable
                    </span>
                  )}
                </div>

                <Button
                  onClick={() => handleEdit(product)}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Package className="h-4 w-4" />
                  Edit Product
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              Edit {editingProduct?.name}
            </DialogTitle>
            <DialogDescription>
              Update product information and pricing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) =>
                  setFormData({ ...formData, shortDescription: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Full Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price (₹)</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, basePrice: parseFloat(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minOrderQuantity">Min Order Quantity</Label>
                <Input
                  id="minOrderQuantity"
                  type="number"
                  value={formData.minOrderQuantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minOrderQuantity: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            {formData.isCustomizable && (
              <>
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Customization Pricing</Label>
                  <p className="text-sm text-muted-foreground">
                    Set prices for logo customization options
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="font-medium">Logo Sizes</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="logoSizeSmall" className="text-xs">Small (2cm)</Label>
                      <Input
                        id="logoSizeSmall"
                        type="number"
                        step="1"
                        value={formData.logoSizeSmallPrice}
                        onChange={(e) =>
                          setFormData({ ...formData, logoSizeSmallPrice: parseFloat(e.target.value) || 0 })
                        }
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="logoSizeMedium" className="text-xs">Medium (4cm)</Label>
                      <Input
                        id="logoSizeMedium"
                        type="number"
                        step="1"
                        value={formData.logoSizeMediumPrice}
                        onChange={(e) =>
                          setFormData({ ...formData, logoSizeMediumPrice: parseFloat(e.target.value) || 0 })
                        }
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="logoSizeLarge" className="text-xs">Large (6cm)</Label>
                      <Input
                        id="logoSizeLarge"
                        type="number"
                        step="1"
                        value={formData.logoSizeLargePrice}
                        onChange={(e) =>
                          setFormData({ ...formData, logoSizeLargePrice: parseFloat(e.target.value) || 0 })
                        }
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="font-medium">Logo Positions</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="logoPositionCenter" className="text-xs">Center</Label>
                      <Input
                        id="logoPositionCenter"
                        type="number"
                        step="1"
                        value={formData.logoPositionCenterPrice}
                        onChange={(e) =>
                          setFormData({ ...formData, logoPositionCenterPrice: parseFloat(e.target.value) || 0 })
                        }
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="logoPositionCorner" className="text-xs">Corner</Label>
                      <Input
                        id="logoPositionCorner"
                        type="number"
                        step="1"
                        value={formData.logoPositionCornerPrice}
                        onChange={(e) =>
                          setFormData({ ...formData, logoPositionCornerPrice: parseFloat(e.target.value) || 0 })
                        }
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="logoPositionRepeated" className="text-xs">Repeated Pattern</Label>
                      <Input
                        id="logoPositionRepeated"
                        type="number"
                        step="1"
                        value={formData.logoPositionRepeatedPrice}
                        onChange={(e) =>
                          setFormData({ ...formData, logoPositionRepeatedPrice: parseFloat(e.target.value) || 0 })
                        }
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Active Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Make product visible to customers
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Featured Product</Label>
                  <p className="text-sm text-muted-foreground">
                    Display on homepage and promotions
                  </p>
                </div>
                <Switch
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isFeatured: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Customizable Product</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to add custom branding
                  </p>
                </div>
                <Switch
                  checked={formData.isCustomizable}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isCustomizable: checked })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProduct(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
