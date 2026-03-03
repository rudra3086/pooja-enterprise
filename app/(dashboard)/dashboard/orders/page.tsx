"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ClipboardList, Search, Filter, Eye, Package, RotateCcw, Trash2, Undo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-context"
import { useToast } from "@/hooks/use-toast"

interface OrderItem {
  id: string
  productId: string
  variantId?: string
  productName: string
  productImageUrl?: string
  variantName?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  customization?: {
    additionalCost?: number
  }
}

interface Order {
  id: string
  orderNumber: string
  createdAt: string
  deliveredAt?: string
  items: OrderItem[]
  subtotal?: number
  taxAmount?: number
  shippingAmount?: number
  discountAmount?: number
  totalAmount: number
  status: string
  paymentMethod: string
  shippingAddressLine1: string
  shippingAddressLine2?: string
  shippingCity: string
  shippingState: string
  shippingPostalCode: string
  clientHiddenAt?: string | null
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export default function OrdersPage() {
  const router = useRouter()
  const { replaceItems } = useCart()
  const { toast } = useToast()
  const [requestedOrderId, setRequestedOrderId] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [visibilityFilter, setVisibilityFilter] = useState<"active" | "removed">("active")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [actionOrderId, setActionOrderId] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const queryParams = new URLSearchParams()
        if (statusFilter !== "all") {
          queryParams.append("status", statusFilter)
        }
        queryParams.append("visibility", visibilityFilter)
        queryParams.append("pageSize", "100") // Fetch more orders at once
        
        const response = await fetch(`/api/orders?${queryParams.toString()}`)
        
        if (!response.ok) {
          if (response.status === 401) {
            setError("Please log in to view your orders")
          } else {
            setError("Failed to fetch orders")
          }
          return
        }

        const result = await response.json()
        if (result.success && result.data) {
          setOrders(result.data.data || [])
        } else {
          setError("Failed to load orders")
        }
      } catch (err) {
        console.error("Orders fetch error:", err)
        setError("An error occurred while loading your orders")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [statusFilter, visibilityFilter])

  useEffect(() => {
    const filtered = orders.filter((order) => {
      const matchesSearch = order.orderNumber
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      return matchesSearch
    })
    setFilteredOrders(filtered)
  }, [searchQuery, orders])

  useEffect(() => {
    if (!requestedOrderId || orders.length === 0) return

    const matchedOrder = orders.find((order) => order.id === requestedOrderId)
    if (matchedOrder) {
      setSelectedOrder(matchedOrder)
    }
  }, [orders, requestedOrderId])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setRequestedOrderId(params.get("orderId"))
  }, [])

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const getStatusColor = (status: string) => {
    return statusColors[status] || "bg-gray-100 text-gray-800"
  }

  const getShippingAddress = (order: Order) => {
    const parts = [
      order.shippingAddressLine1,
      order.shippingAddressLine2,
      order.shippingCity,
      order.shippingState,
      order.shippingPostalCode,
    ]
    return parts.filter(Boolean).join(", ")
  }

  const calculateItemsSubtotal = (order: Order) => {
    return (order.items || []).reduce((total, item) => total + item.unitPrice * item.quantity, 0)
  }

  const calculateCustomizationTotal = (order: Order) => {
    return (order.items || []).reduce((total, item) => {
      const explicitCustomizationCost = (item.customization?.additionalCost || 0) * item.quantity
      if (explicitCustomizationCost > 0) {
        return total + explicitCustomizationCost
      }

      const derivedCustomizationCost = item.totalPrice - item.unitPrice * item.quantity
      return total + Math.max(0, derivedCustomizationCost)
    }, 0)
  }

  const refreshOrders = async () => {
    const queryParams = new URLSearchParams()
    if (statusFilter !== "all") {
      queryParams.append("status", statusFilter)
    }
    queryParams.append("visibility", visibilityFilter)
    queryParams.append("pageSize", "100")

    const response = await fetch(`/api/orders?${queryParams.toString()}`)
    const result = await response.json()
    if (response.ok && result.success && result.data) {
      setOrders(result.data.data || [])
    }
  }

  const handleRepeatOrder = (order: Order) => {
    if (!order.items || order.items.length === 0) {
      toast({
        title: "No items to repeat",
        description: "This order does not contain repeatable items.",
        variant: "destructive",
      })
      return
    }

    const repeatedItems = order.items.map((item, index) => ({
      id: `${item.productId}-${item.variantId || "base"}-${index}`,
      productId: item.productId,
      name: item.productName,
      description: item.variantName ? `Variant: ${item.variantName}` : "Repeated from previous order",
      price: item.unitPrice,
      quantity: item.quantity,
      image: item.productImageUrl,
      customizable: !!item.customization,
      customization: item.customization as any,
    }))

    replaceItems(repeatedItems)
    toast({
      title: "Order repeated",
      description: "Previous items were added to your cart.",
    })
    router.push("/dashboard/cart")
  }

  const handleRemoveOrder = async (order: Order) => {
    if (order.status !== "delivered" && order.status !== "cancelled") return
    setActionOrderId(order.id)
    try {
      const response = await fetch(`/api/orders/${order.id}`, { method: "DELETE" })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to remove order")
      }

      toast({
        title: "Order removed",
        description: "You can restore it anytime from Removed Orders.",
      })
      await refreshOrders()
    } catch (error) {
      toast({
        title: "Failed to remove",
        description: error instanceof Error ? error.message : "Try again.",
        variant: "destructive",
      })
    } finally {
      setActionOrderId(null)
    }
  }

  const handleRestoreOrder = async (orderId: string) => {
    setActionOrderId(orderId)
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore" }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to restore order")
      }

      toast({
        title: "Order restored",
        description: "The order is back in your active orders list.",
      })
      await refreshOrders()
    } catch (error) {
      toast({
        title: "Failed to restore",
        description: error instanceof Error ? error.message : "Try again.",
        variant: "destructive",
      })
    } finally {
      setActionOrderId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="font-serif text-3xl font-semibold">Orders</h1>
          <p className="mt-1 text-muted-foreground">Loading your orders...</p>
        </motion.div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 sm:p-6">
                <div className="h-12 bg-muted rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="font-serif text-3xl font-semibold">Orders</h1>
          <p className="mt-1 text-red-600">{error}</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-serif text-3xl font-semibold">Orders</h1>
        <p className="mt-1 text-muted-foreground">
          View and track your order history
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search order number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={visibilityFilter} onValueChange={(value) => setVisibilityFilter(value as "active" | "removed")}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Orders visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active Orders</SelectItem>
            <SelectItem value="removed">Removed Orders</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Orders List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="space-y-4"
      >
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ClipboardList className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 font-semibold">No orders found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "You haven't placed any orders yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-lg">{order.orderNumber}</span>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Ordered on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.items?.length || 0} {(order.items?.length || 0) === 1 ? "item" : "items"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-semibold">
                        ₹{order.totalAmount.toLocaleString("en-IN")}
                      </div>
                      <p className="text-xs text-muted-foreground">{order.paymentMethod}</p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleRepeatOrder(order)}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Repeat Order
                    </Button>
                    {visibilityFilter === "active" && (order.status === "delivered" || order.status === "cancelled") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-destructive hover:text-destructive"
                        onClick={() => handleRemoveOrder(order)}
                        disabled={actionOrderId === order.id}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    )}
                    {visibilityFilter === "removed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleRestoreOrder(order.id)}
                        disabled={actionOrderId === order.id}
                      >
                        <Undo2 className="h-4 w-4" />
                        Restore
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </motion.div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
              <DialogHeader>
                <DialogTitle className="flex flex-col gap-2 pr-10 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-serif text-xl">{selectedOrder.orderNumber}</span>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {getStatusLabel(selectedOrder.status)}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 overflow-y-auto pr-1">
                {/* Order Date */}
                <div>
                  <p className="text-sm text-muted-foreground">
                    Ordered on {new Date(selectedOrder.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  {selectedOrder.status === "delivered" && selectedOrder.deliveredAt && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Delivered on {new Date(selectedOrder.deliveredAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>

                {/* Items */}
                <div className="space-y-3">
                  <h4 className="font-medium">Items</h4>
                  {(selectedOrder.items || []).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-background flex items-center justify-center overflow-hidden">
                          {item.productImageUrl ? (
                            <img
                              src={item.productImageUrl}
                              alt={item.productName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {item.productName}
                            {item.variantName && ` - ${item.variantName}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity}
                            {item.customization && " • Customized"}
                          </p>
                        </div>
                      </div>
                      <span className="font-medium">
                        ₹{(item.unitPrice * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Shipping Address */}
                <div>
                  <h4 className="font-medium mb-2">Shipping Address</h4>
                  <p className="text-sm text-muted-foreground">
                    {getShippingAddress(selectedOrder)}
                  </p>
                </div>

                {/* Payment */}
                <div>
                  <h4 className="font-medium mb-2">Payment Method</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.paymentMethod.replace(/_/g, " ").charAt(0).toUpperCase() +
                      selectedOrder.paymentMethod.slice(1).replace(/_/g, " ")}
                  </p>
                </div>

                <Separator />

                {/* Cost Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items Subtotal</span>
                    <span>₹{calculateItemsSubtotal(selectedOrder).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Customization Cost</span>
                    <span>₹{calculateCustomizationTotal(selectedOrder).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>₹{(selectedOrder.taxAmount || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {(selectedOrder.shippingAmount || 0) === 0
                        ? "Free"
                        : `₹${(selectedOrder.shippingAmount || 0).toLocaleString("en-IN")}`}
                    </span>
                  </div>
                  {(selectedOrder.discountAmount || 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span>-₹{(selectedOrder.discountAmount || 0).toLocaleString("en-IN")}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="font-medium">Total</span>
                  <span className="text-xl font-semibold">
                    ₹{selectedOrder.totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}
