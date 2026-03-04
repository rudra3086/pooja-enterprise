"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, Eye, Package, Download, MapPin, Trash2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import type { Order } from "@/lib/types"

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

const statusLabels = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

const paymentMethodLabels = {
  bank_transfer: "Bank Transfer",
  upi: "UPI",
  credit_terms: "Credit Terms",
}

export default function AdminOrdersPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"active" | "removed">("active")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null)
  const [restoringOrderId, setRestoringOrderId] = useState<string | null>(null)
  const [bulkDeleting, setBulkDeleting] = useState<"delivered" | "cancelled" | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [statusFilter, viewMode])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }
      params.append("view", viewMode)
      params.append("pageSize", "100") // Get more orders for admin view

      const response = await fetch(`/api/admin/orders?${params}`)
      const data = await response.json()

      if (data.success && data.data) {
        setOrders(data.data.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchLower) ||
      order.client?.businessName.toLowerCase().includes(searchLower) ||
      order.client?.email.toLowerCase().includes(searchLower)
    return matchesSearch
  })

  const handleStatusChange = async (orderId: string, newStatus: Order["status"]) => {
    try {
      setUpdatingOrderId(orderId)
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (data.success) {
        // Update local state
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        )
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus })
        }
        toast({
          title: "Status updated",
          description: `Order ${data.data.orderNumber} status changed to ${statusLabels[newStatus]}`,
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update order status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      })
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    const confirmed = window.confirm(`Remove order ${orderNumber} from admin UI?`)
    if (!confirmed) return

    try {
      setDeletingOrderId(orderId)
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      })
      const data = await response.json()

      if (data.success) {
        setOrders((prev) => prev.filter((order) => order.id !== orderId))
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(null)
        }
        toast({ title: "Order removed", description: `${orderNumber} has been removed from admin UI.` })
      } else {
        toast({ title: "Error", description: data.error || "Failed to delete order", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete order", variant: "destructive" })
    } finally {
      setDeletingOrderId(null)
    }
  }

  const handleBulkDelete = async (scope: "delivered" | "cancelled") => {
    const label = scope === "delivered" ? "all delivered orders" : "all cancelled orders"
    const confirmed = window.confirm(`Remove ${label} from admin UI?`)
    if (!confirmed) return

    try {
      setBulkDeleting(scope)
      const response = await fetch(`/api/admin/orders?scope=${scope}`, {
        method: "DELETE",
      })
      const data = await response.json()

      if (data.success) {
        toast({
          title: "Cleanup completed",
          description: `${data.data?.deletedCount ?? 0} order(s) removed from admin UI.`,
        })
        fetchOrders()
      } else {
        toast({ title: "Error", description: data.error || "Failed to delete orders", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete orders", variant: "destructive" })
    } finally {
      setBulkDeleting(null)
    }
  }

  const canRemoveOrder = (order: Order) =>
    order.status === "delivered" || order.status === "cancelled"

  const getGoogleMapsUrl = (latitude?: number, longitude?: number) => {
    if (latitude === undefined || longitude === undefined) return null
    return `https://www.google.com/maps?q=${latitude},${longitude}`
  }

  const handleRestoreOrder = async (orderId: string, orderNumber: string) => {
    try {
      setRestoringOrderId(orderId)
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        setOrders((prev) => prev.filter((order) => order.id !== orderId))
        toast({ title: "Order restored", description: `${orderNumber} is visible in active orders again.` })
      } else {
        toast({ title: "Error", description: data.error || "Failed to restore order", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to restore order", variant: "destructive" })
    } finally {
      setRestoringOrderId(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-serif text-3xl font-semibold">Orders Management</h1>
        <p className="mt-1 text-muted-foreground">
          View and manage all customer orders
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="space-y-3"
      >
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order number or customer..."
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
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={viewMode} onValueChange={(value) => setViewMode(value as "active" | "removed") }>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active Orders</SelectItem>
              <SelectItem value="removed">Removed Orders</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {viewMode === "active" && (
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-card/50 p-3 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bulk Cleanup</span>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => handleBulkDelete("delivered")}
              disabled={bulkDeleting !== null || loading}
            >
              <Trash2 className="h-4 w-4" />
              {bulkDeleting === "delivered" ? "Deleting..." : "Delete Delivered"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => handleBulkDelete("cancelled")}
              disabled={bulkDeleting !== null || loading}
            >
              <Trash2 className="h-4 w-4" />
              {bulkDeleting === "cancelled" ? "Deleting..." : "Delete Cancelled"}
            </Button>
          </div>
        )}
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-32" />
                    <Skeleton className="h-12 flex-1" />
                    <Skeleton className="h-12 w-24" />
                    <Skeleton className="h-12 w-24" />
                  </div>
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No orders found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-muted-foreground">Order Number</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Customer</th>
                      <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Date</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Total</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b border-border last:border-0">
                        <td className="p-4">
                          <span className="font-medium">{order.orderNumber}</span>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{order.client?.businessName || "Unknown"}</p>
                            <p className="text-sm text-muted-foreground">{order.client?.email || ""}</p>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <span className="text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString("en-IN")}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold">
                            ₹{order.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="p-4">
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleStatusChange(order.id, value as Order["status"])}
                            disabled={updatingOrderId === order.id}
                          >
                            <SelectTrigger className="w-32">
                              <Badge className={statusColors[order.status]}>
                                {statusLabels[order.status]}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                            {viewMode === "active" && canRemoveOrder(order) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteOrder(order.id, order.orderNumber)}
                                disabled={deletingOrderId === order.id}
                              >
                                <Trash2 className="h-4 w-4" />
                                {deletingOrderId === order.id ? "Deleting..." : "Delete"}
                              </Button>
                            )}
                            {viewMode === "removed" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 text-green-700 hover:text-green-800"
                                onClick={() => handleRestoreOrder(order.id, order.orderNumber)}
                                disabled={restoringOrderId === order.id}
                              >
                                <RotateCcw className="h-4 w-4" />
                                {restoringOrderId === order.id ? "Restoring..." : "Restore"}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader className="pr-10">
                <DialogTitle className="flex flex-wrap items-center gap-2">
                  <span className="font-serif text-xl">{selectedOrder.orderNumber}</span>
                  <Badge className={statusColors[selectedOrder.status]}>
                    {statusLabels[selectedOrder.status]}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Customer Info */}
                <div>
                  <h4 className="font-medium mb-2">Customer</h4>
                  <p className="text-sm">{selectedOrder.client?.businessName || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.client?.email || ""}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.client?.phone || ""}</p>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  <h4 className="font-medium">Items</h4>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, index) => (
                      <div key={index} className="rounded-lg bg-muted p-4 space-y-3">
                        <div className="flex items-center justify-between">
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
                                {item.sku && ` • SKU: ${item.sku}`}
                              </p>
                            </div>
                          </div>
                          <span className="font-medium">
                            ₹{item.totalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>

                        {/* Customization Details */}
                        {item.customization && (
                          <div className="border-t border-border pt-3 space-y-2">
                            <p className="text-sm font-medium">Customization Details:</p>
                            <div className="space-y-2 text-xs">
                              {(item.customization as any).logoSize && (
                                <p><span className="text-muted-foreground">Size:</span> {(item.customization as any).logoSize}</p>
                              )}
                              {(item.customization as any).logoPosition && (
                                <p><span className="text-muted-foreground">Position:</span> {(item.customization as any).logoPosition}</p>
                              )}
                              {(item.customization as any).additionalCost !== undefined && (
                                <p><span className="text-muted-foreground">Customization Cost:</span> ₹{(item.customization as any).additionalCost}</p>
                              )}
                            </div>

                            {/* Logo Preview and Download */}
                            {(item.customization as any).logoFile && (
                              <div className="border-t border-border pt-3 space-y-2">
                                <p className="text-sm font-medium">Uploaded Logo:</p>
                                <div className="flex items-center gap-3">
                                  <img
                                    src={(item.customization as any).logoFile}
                                    alt="Logo"
                                    className="h-20 w-20 object-contain border border-border rounded"
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const link = document.createElement("a")
                                      link.href = (item.customization as any).logoFile
                                      link.download = `logo-${item.productName}-${Date.now()}.png`
                                      document.body.appendChild(link)
                                      link.click()
                                      document.body.removeChild(link)
                                    }}
                                    className="gap-2"
                                  >
                                    <Download className="h-4 w-4" />
                                    Download
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No items</p>
                  )}
                </div>

                <Separator />

                {/* Order Summary */}
                <div className="space-y-2">
                  <h4 className="font-medium mb-2">Order Summary</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{selectedOrder.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (GST)</span>
                    <span>₹{selectedOrder.taxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>₹{selectedOrder.shippingAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-green-600">-₹{selectedOrder.discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Shipping Address */}
                <div>
                  <h4 className="font-medium mb-2">Shipping Address</h4>
                  {!selectedOrder.requiresShipping ? (
                    <p className="text-sm text-muted-foreground">Customer selected self pickup (shipping not required).</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.shippingName}<br />
                      {selectedOrder.shippingPhone}<br />
                      {selectedOrder.shippingAddressLine1}<br />
                      {selectedOrder.shippingAddressLine2 && <>{selectedOrder.shippingAddressLine2}<br /></>}
                      {selectedOrder.shippingCity}, {selectedOrder.shippingState} {selectedOrder.shippingPostalCode}<br />
                      {selectedOrder.shippingCountry}
                    </p>
                  )}
                </div>

                {selectedOrder.requiresShipping && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Delivery Distance
                    </h4>
                    {(() => {
                      const deliveryMapsUrl = getGoogleMapsUrl(
                        selectedOrder.deliveryLatitude,
                        selectedOrder.deliveryLongitude
                      )

                      return (
                    <p className="text-sm text-muted-foreground">
                      Distance: {selectedOrder.distanceKm?.toFixed(2) || "0.00"} km<br />
                      Cost per km: ₹{selectedOrder.deliveryCostPerKm?.toFixed(2) || "0.00"}<br />
                      Delivery point: {deliveryMapsUrl ? (
                        <a
                          href={deliveryMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2 text-primary hover:text-primary/80"
                        >
                          {selectedOrder.deliveryLatitude?.toFixed(6)}, {selectedOrder.deliveryLongitude?.toFixed(6)}
                        </a>
                      ) : (
                        <>{selectedOrder.deliveryLatitude?.toFixed(6)}, {selectedOrder.deliveryLongitude?.toFixed(6)}</>
                      )}<br />
                      Production point: {selectedOrder.productionLatitude?.toFixed(6)}, {selectedOrder.productionLongitude?.toFixed(6)}
                    </p>
                      )
                    })()}
                  </div>
                )}

                {/* Payment */}
                <div>
                  <h4 className="font-medium mb-2">Payment Details</h4>
                  <p className="text-sm text-muted-foreground">
                    Method: {paymentMethodLabels[selectedOrder.paymentMethod]}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status: <Badge className={selectedOrder.paymentStatus === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                    </Badge>
                  </p>
                </div>

                {selectedOrder.customerNotes && (
                  <div>
                    <h4 className="font-medium mb-2">Customer Notes</h4>
                    <p className="text-sm text-muted-foreground">{selectedOrder.customerNotes}</p>
                  </div>
                )}

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount</span>
                  <span className="text-xl font-semibold">
                    ₹{selectedOrder.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <DialogFooter>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value) => {
                    handleStatusChange(selectedOrder.id, value as Order["status"])
                    setSelectedOrder(null)
                  }}
                  disabled={updatingOrderId === selectedOrder.id}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Change Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Mark as Pending</SelectItem>
                    <SelectItem value="confirmed">Mark as Confirmed</SelectItem>
                    <SelectItem value="processing">Mark as Processing</SelectItem>
                    <SelectItem value="shipped">Mark as Shipped</SelectItem>
                    <SelectItem value="delivered">Mark as Delivered</SelectItem>
                    <SelectItem value="cancelled">Mark as Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}
