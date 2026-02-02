"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, Eye, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useToast } from "@/hooks/use-toast"

interface Order {
  id: string
  customer: string
  email: string
  date: string
  items: Array<{
    name: string
    quantity: number
    price: number
    customized: boolean
  }>
  total: number
  status: "Pending" | "Active" | "Completed"
  shippingAddress: string
  paymentMethod: string
}

const orders: Order[] = [
  {
    id: "ORD-2024-001",
    customer: "Royal Restaurant",
    email: "orders@royal.com",
    date: "2024-01-15",
    items: [
      { name: "Tissue Napkin", quantity: 500, price: 25, customized: true },
      { name: "Tissue Roll", quantity: 200, price: 45, customized: false },
    ],
    total: 21500,
    status: "Completed",
    shippingAddress: "45 Food Street, Restaurant Lane, Mumbai - 400002",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "ORD-2024-002",
    customer: "XYZ Hotels",
    email: "purchase@xyzhotels.com",
    date: "2024-01-18",
    items: [
      { name: "Ultra Soft Tissue", quantity: 1000, price: 35, customized: true },
    ],
    total: 35000,
    status: "Active",
    shippingAddress: "789 Hospitality Road, Hotel District, Delhi - 110001",
    paymentMethod: "UPI",
  },
  {
    id: "ORD-2024-003",
    customer: "ABC Enterprises",
    email: "john@company.com",
    date: "2024-01-22",
    items: [
      { name: "Aluminium Foil", quantity: 50, price: 120, customized: false },
      { name: "Tissue Napkin", quantity: 200, price: 25, customized: false },
    ],
    total: 11000,
    status: "Pending",
    shippingAddress: "123 Business Park, Industrial Area, Mumbai - 400001",
    paymentMethod: "Credit Card",
  },
  {
    id: "ORD-2024-004",
    customer: "Grand Hotel",
    email: "supplies@grandhotel.com",
    date: "2024-01-25",
    items: [
      { name: "Tissue Roll", quantity: 500, price: 45, customized: false },
    ],
    total: 22500,
    status: "Active",
    shippingAddress: "1 Luxury Avenue, Premium District, Bangalore - 560001",
    paymentMethod: "Bank Transfer",
  },
]

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800",
  Active: "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
}

export default function AdminOrdersPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderStatuses, setOrderStatuses] = useState<Record<string, Order["status"]>>(
    Object.fromEntries(orders.map((o) => [o.id, o.status]))
  )

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || orderStatuses[order.id] === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = (orderId: string, newStatus: Order["status"]) => {
    setOrderStatuses((prev) => ({ ...prev, [orderId]: newStatus }))
    toast({
      title: "Status updated",
      description: `Order ${orderId} status changed to ${newStatus}`,
    })
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
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order ID or customer..."
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
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-muted-foreground">Order ID</th>
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
                        <span className="font-medium">{order.id}</span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{order.customer}</p>
                          <p className="text-sm text-muted-foreground">{order.email}</p>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="text-muted-foreground">
                          {new Date(order.date).toLocaleDateString("en-IN")}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold">₹{order.total.toLocaleString()}</span>
                      </td>
                      <td className="p-4">
                        <Select
                          value={orderStatuses[order.id]}
                          onValueChange={(value) => handleStatusChange(order.id, value as Order["status"])}
                        >
                          <SelectTrigger className="w-32">
                            <Badge className={statusColors[orderStatuses[order.id]]}>
                              {orderStatuses[order.id]}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span className="font-serif text-xl">{selectedOrder.id}</span>
                  <Badge className={statusColors[orderStatuses[selectedOrder.id]]}>
                    {orderStatuses[selectedOrder.id]}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Customer Info */}
                <div>
                  <h4 className="font-medium mb-2">Customer</h4>
                  <p className="text-sm">{selectedOrder.customer}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.email}</p>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  <h4 className="font-medium">Items</h4>
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-background flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity} {item.customized && "• Customized"}
                          </p>
                        </div>
                      </div>
                      <span className="font-medium">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Shipping Address */}
                <div>
                  <h4 className="font-medium mb-2">Shipping Address</h4>
                  <p className="text-sm text-muted-foreground">{selectedOrder.shippingAddress}</p>
                </div>

                {/* Payment */}
                <div>
                  <h4 className="font-medium mb-2">Payment Method</h4>
                  <p className="text-sm text-muted-foreground">{selectedOrder.paymentMethod}</p>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total</span>
                  <span className="text-xl font-semibold">₹{selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>

              <DialogFooter>
                <Select
                  value={orderStatuses[selectedOrder.id]}
                  onValueChange={(value) => {
                    handleStatusChange(selectedOrder.id, value as Order["status"])
                    setSelectedOrder(null)
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Change Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Mark as Pending</SelectItem>
                    <SelectItem value="Active">Mark as Active</SelectItem>
                    <SelectItem value="Completed">Mark as Completed</SelectItem>
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
