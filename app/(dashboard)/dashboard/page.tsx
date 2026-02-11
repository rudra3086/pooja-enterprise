"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Package,
  Clock,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  ShoppingCart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface DashboardData {
  totalOrders: number
  activeOrders: number
  completedOrders: number
  totalSpent: number
  recentOrders: Array<{
    id: string
    date: string
    items: string
    total: number
    status: string
  }>
  clientName: string
}

const getStatsConfig = (data: DashboardData) => [
  {
    title: "Total Orders",
    value: data.totalOrders.toString(),
    icon: Package,
    description: "All time orders",
    trend: null,
  },
  {
    title: "Active Orders",
    value: data.activeOrders.toString(),
    icon: Clock,
    description: "Currently processing",
    trend: null,
  },
  {
    title: "Completed",
    value: data.completedOrders.toString(),
    icon: CheckCircle,
    description: "Successfully delivered",
    trend: null,
  },
  {
    title: "Total Spent",
    value: `₹${data.totalSpent.toLocaleString("en-IN")}`,
    icon: TrendingUp,
    description: "All time",
    trend: null,
  },
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
    transition: { duration: 0.4 },
  },
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/dashboard/stats")
        
        if (!response.ok) {
          if (response.status === 401) {
            setError("Please log in to view your dashboard")
          } else {
            setError("Failed to fetch dashboard data")
          }
          return
        }

        const result = await response.json()
        if (result.success && result.data) {
          setData(result.data)
        } else {
          setError("Failed to load dashboard data")
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err)
        setError("An error occurred while loading your dashboard")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="font-serif text-3xl font-semibold">Welcome back</h1>
          <p className="mt-1 text-muted-foreground">Loading your dashboard...</p>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="font-serif text-3xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-muted-foreground text-red-600">{error || "Failed to load dashboard"}</p>
        </motion.div>
      </div>
    )
  }

  const stats = getStatsConfig(data)

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-serif text-3xl font-semibold">Welcome back, {data.clientName}</h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s what&apos;s happening with your orders today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{stat.value}</div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                  {stat.trend && (
                    <span className="text-xs font-medium text-green-600">{stat.trend}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex flex-wrap gap-4"
      >
        <Link href="/dashboard/products">
          <Button className="gap-2">
            <Package className="h-4 w-4" />
            Browse Products
          </Button>
        </Link>
        <Link href="/dashboard/cart">
          <Button variant="outline" className="gap-2 bg-transparent">
            <ShoppingCart className="h-4 w-4" />
            View Cart
          </Button>
        </Link>
      </motion.div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-serif text-xl">Recent Orders</CardTitle>
            <Link href="/dashboard/orders">
              <Button variant="ghost" size="sm" className="gap-1 group">
                View All
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data.recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No orders yet. Start shopping!</p>
                <Link href="/dashboard/products" className="mt-4 inline-block">
                  <Button size="sm">Browse Products</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {data.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-border"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{order.id}</span>
                        <Badge
                          variant={
                            order.status === "Delivered"
                              ? "default"
                              : order.status === "Pending" || order.status === "Confirmed"
                                ? "secondary"
                                : "outline"
                          }
                          className={
                            order.status === "Delivered"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : order.status === "Pending" || order.status === "Confirmed"
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                : ""
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{order.items}</p>
                      <p className="text-xs text-muted-foreground">
                        Ordered on {new Date(order.date).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₹{order.total.toLocaleString("en-IN")}</div>
                      <Link href="/dashboard/orders">
                        <Button variant="ghost" size="sm" className="mt-1">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
