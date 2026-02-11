"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Package, Search, Edit, Plus, AlertTriangle, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

interface Product {
  id: string
  productId: string
  productName: string
  name: string
  sku: string
  stock: number
  minStock: number
  price: number
  imageUrl?: string
}

function getStockStatus(stock: number, minStock: number) {
  if (stock <= minStock * 0.5) return "critical"
  if (stock <= minStock) return "low"
  return "good"
}

const statusConfig = {
  good: { label: "In Stock", class: "bg-green-100 text-green-800" },
  low: { label: "Low Stock", class: "bg-amber-100 text-amber-800" },
  critical: { label: "Critical", class: "bg-red-100 text-red-800" },
}

export default function AdminStockPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [editForm, setEditForm] = useState({
    stock: 0,
    minStock: 0,
    price: 0,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchStockData()
  }, [])

  const fetchStockData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/stock?pageSize=100")
      
      if (!response.ok) {
        throw new Error(`Failed to load stock data (${response.status})`)
      }

      const data = await response.json()

      if (data.success && data.data && Array.isArray(data.data.data)) {
        const variants = data.data.data.map((v: any) => ({
          id: v.id,
          productId: v.productId,
          productName: v.productName,
          name: v.name,
          sku: v.sku,
          stock: v.stockQuantity,
          minStock: v.lowStockThreshold || 100,
          price: v.price,
          imageUrl: v.imageUrl,
        }))
        setProducts(variants)
      } else {
        throw new Error("Invalid data format")
      }
    } catch (error) {
      console.error("Error fetching stock:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load stock data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const lowStockCount = products.filter(
    (p) => getStockStatus(p.stock, p.minStock) !== "good"
  ).length

  const handleEdit = (product: Product) => {
    setEditProduct(product)
    setEditForm({
      stock: product.stock,
      minStock: product.minStock,
      price: product.price,
    })
  }

  const handleSave = async () => {
    if (!editProduct) return

    try {
      setSaving(true)

      const stockResponse = await fetch("/api/admin/stock", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: editProduct.id,
          quantity: editForm.stock,
          operation: "set",
          price: editForm.price,
          lowStockThreshold: editForm.minStock,
        }),
      })

      if (!stockResponse.ok) {
        throw new Error("Failed to update variant")
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === editProduct.id
            ? { ...p, stock: editForm.stock, minStock: editForm.minStock, price: editForm.price }
            : p
        )
      )

      toast({
        title: "Variant updated",
        description: `${editProduct.productName} - ${editProduct.name} has been updated successfully.`,
      })

      setEditProduct(null)
    } catch (error) {
      console.error("Error updating variant:", error)
      toast({
        title: "Error",
        description: "Failed to update variant",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
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
          <h1 className="font-serif text-3xl font-bold">Stock Management</h1>
          <p className="mt-1 text-muted-foreground">
            Monitor and update product inventory
          </p>
        </div>
        {lowStockCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-900">
              {lowStockCount} product{lowStockCount > 1 ? "s" : ""} low on stock
            </span>
          </div>
        )}
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </motion.div>

      {/* Stock Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid gap-4 md:grid-cols-2"
      >
        {loading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <Skeleton className="h-16 w-16 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Skeleton className="h-8 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : filteredProducts.length === 0 ? (
          <Card className="md:col-span-2">
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="mt-4 text-muted-foreground">No products found</p>
            </CardContent>
          </Card>
        ) : (
          filteredProducts.map((product) => {
          const status = getStockStatus(product.stock, product.minStock)
          return (
            <Card key={product.id} className={status !== "good" ? "border-amber-200" : ""}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden relative">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.productName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{product.productName}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{product.name}</p>
                      <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                      <p className="text-sm text-muted-foreground mt-1">₹{product.price.toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-semibold">{product.stock}</span>
                      <span className="text-sm text-muted-foreground">units</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Min. stock: {product.minStock} units
                    </p>
                  </div>
                  <Badge className={statusConfig[status].class}>
                    {status !== "good" && <AlertTriangle className="h-3 w-3 mr-1" />}
                    {statusConfig[status].label}
                  </Badge>
                </div>

                {/* Stock Bar */}
                <div className="mt-4">
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        status === "good"
                          ? "bg-green-500"
                          : status === "low"
                            ? "bg-amber-500"
                            : "bg-red-500"
                      }`}
                      style={{
                        width: `${Math.min((product.stock / (product.minStock * 3)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })
        )}
      </motion.div>

      {/* Edit Stock Dialog */}
      <AnimatePresence>
        {editProduct && (
          <Dialog open={!!editProduct} onOpenChange={() => setEditProduct(null)}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">Update Stock</DialogTitle>
                <DialogDescription>
                  Update inventory for {editProduct.productName} - {editProduct.name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Current Stock (units)</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={editForm.stock}
                    onChange={(e) => setEditForm({ ...editForm, stock: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minStock">Minimum Stock Threshold (units)</Label>
                  <Input
                    id="minStock"
                    type="number"
                    value={editForm.minStock}
                    onChange={(e) => setEditForm({ ...editForm, minStock: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">Alert when stock falls below this level</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">Price per unit for this variant</p>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditForm({ ...editForm, stock: editForm.stock + 100 })}
                    className="flex-1"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add 100
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditForm({ ...editForm, stock: editForm.stock + 500 })}
                    className="flex-1"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add 500
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditForm({ ...editForm, stock: editForm.stock + 1000 })}
                    className="flex-1"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add 1000
                  </Button>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setEditProduct(null)} disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="gap-2" disabled={saving}>
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}
