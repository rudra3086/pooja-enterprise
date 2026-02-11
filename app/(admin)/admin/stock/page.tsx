"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Package, Search, Edit, Plus, AlertTriangle, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  name: string
  description: string
  stock: number
  minStock: number
  price: number
  unit: string
}

const initialProducts: Product[] = [
  {
    id: "prod-1",
    name: "Tissue Napkin",
    description: "Premium quality napkins for restaurants and hotels",
    stock: 2500,
    minStock: 500,
    price: 25,
    unit: "pack of 100",
  },
  {
    id: "prod-2",
    name: "Tissue Roll",
    description: "Soft and absorbent tissue rolls for commercial use",
    stock: 180,
    minStock: 200,
    price: 45,
    unit: "pack of 6",
  },
  {
    id: "prod-3",
    name: "Ultra Soft Tissue Napkin",
    description: "Premium ultra-soft tissues for luxury hospitality",
    stock: 3200,
    minStock: 500,
    price: 35,
    unit: "pack of 100",
  },
  {
    id: "prod-4",
    name: "Aluminium Foil",
    description: "Food-grade aluminum foil for packaging and kitchen use",
    stock: 45,
    minStock: 100,
    price: 120,
    unit: "roll (72m)",
  },
]

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
  const [products, setProducts] = useState(initialProducts)
  const [searchQuery, setSearchQuery] = useState("")
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [editForm, setEditForm] = useState({
    stock: 0,
    minStock: 0,
    price: 0,
  })

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleSave = () => {
    if (!editProduct) return

    setProducts((prev) =>
      prev.map((p) =>
        p.id === editProduct.id
          ? { ...p, stock: editForm.stock, minStock: editForm.minStock, price: editForm.price }
          : p
      )
    )

    toast({
      title: "Stock updated",
      description: `${editProduct.name} stock has been updated successfully.`,
    })

    setEditProduct(null)
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
        {filteredProducts.map((product) => {
          const status = getStockStatus(product.stock, product.minStock)
          return (
            <Card key={product.id} className={status !== "good" ? "border-amber-200" : ""}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                      <p className="text-sm text-muted-foreground mt-1">₹{product.price} / {product.unit}</p>
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
        })}
      </motion.div>

      {/* Edit Stock Dialog */}
      <AnimatePresence>
        {editProduct && (
          <Dialog open={!!editProduct} onOpenChange={() => setEditProduct(null)}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">Update Stock</DialogTitle>
                <DialogDescription>
                  Update inventory for {editProduct.name}
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
                  <Label htmlFor="minStock">Minimum Stock Level (units)</Label>
                  <Input
                    id="minStock"
                    type="number"
                    value={editForm.minStock}
                    onChange={(e) => setEditForm({ ...editForm, minStock: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price per {editProduct.unit} (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: parseInt(e.target.value) || 0 })}
                  />
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
                <Button variant="outline" onClick={() => setEditProduct(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}
