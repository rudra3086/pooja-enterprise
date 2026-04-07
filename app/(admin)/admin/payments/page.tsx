"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import type { PaymentOrder } from "@/lib/types"

const statusBadgeClass: Record<PaymentOrder["status"], string> = {
  pending: "bg-yellow-100 text-yellow-800",
  verification_pending: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
}

export default function AdminPaymentsPage() {
  const { toast } = useToast()
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [orders, setOrders] = useState<PaymentOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

  const loadOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      const response = await fetch(`/api/admin/payments?${params.toString()}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch payment orders")
      }

      setOrders(result.data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unable to load payments",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [statusFilter])

  const totals = useMemo(() => {
    return orders.reduce(
      (acc, item) => {
        acc.count += 1
        acc.amount += item.amount
        return acc
      },
      { count: 0, amount: 0 }
    )
  }, [orders])

  const updateStatus = async (orderId: string, status: "paid" | "rejected") => {
    try {
      setUpdatingOrderId(orderId)
      const response = await fetch(`/api/admin/payments/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to update status")
      }

      toast({
        title: "Updated",
        description: `Order ${orderId} marked as ${status}`,
      })
      await loadOrders()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unable to update status",
        variant: "destructive",
      })
    } finally {
      setUpdatingOrderId(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>UPI Payment Verifications</CardTitle>
          <div className="w-52">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verification_pending">Verification Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-sm text-muted-foreground">
            Total records: {totals.count} | Total amount: INR {totals.amount.toFixed(2)}
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading payments...</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payment orders found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-3 py-2 font-medium">Order ID</th>
                    <th className="px-3 py-2 font-medium">Amount</th>
                    <th className="px-3 py-2 font-medium">Screenshot</th>
                    <th className="px-3 py-2 font-medium">UTR</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b align-top">
                      <td className="px-3 py-3 font-medium">{order.orderId}</td>
                      <td className="px-3 py-3">INR {order.amount.toFixed(2)}</td>
                      <td className="px-3 py-3">
                        {order.screenshotUrl ? (
                          <a href={order.screenshotUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                            View Screenshot
                          </a>
                        ) : (
                          <span className="text-muted-foreground">Not uploaded</span>
                        )}
                      </td>
                      <td className="px-3 py-3">{order.utr || "-"}</td>
                      <td className="px-3 py-3">
                        <Badge className={statusBadgeClass[order.status]}>
                          {order.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateStatus(order.orderId, "paid")}
                            disabled={updatingOrderId === order.orderId}
                          >
                            Mark Paid
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateStatus(order.orderId, "rejected")}
                            disabled={updatingOrderId === order.orderId}
                          >
                            Mark Rejected
                          </Button>
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
    </div>
  )
}
