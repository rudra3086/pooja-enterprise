"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  DollarSign,
  Clock,
  CheckCircle,
  Package,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const stats = [
  {
    title: "Total Revenue",
    value: "₹12,45,000",
    icon: DollarSign,
    description: "This month",
    trend: "+23%",
    trendUp: true,
  },
  {
    title: "Pending Orders",
    value: "8",
    icon: Clock,
    description: "Awaiting processing",
    trend: null,
    trendUp: null,
  },
  {
    title: "Completed Orders",
    value: "156",
    icon: CheckCircle,
    description: "This month",
    trend: "+12%",
    trendUp: true,
  },
  {
    title: "Low Stock Items",
    value: "3",
    icon: AlertTriangle,
    description: "Need restocking",
    trend: null,
    trendUp: null,
  },
]

const recentOrders = [
  {
    id: "ORD-2024-003",
    customer: "ABC Enterprises",
    date: "2024-01-22",
    total: "₹11,000",
    status: "Pending",
  },
  {
    id: "ORD-2024-002",
    customer: "XYZ Hotels",
    date: "2024-01-18",
    total: "₹35,000",
    status: "Active",
  },
  {
    id: "ORD-2024-001",
    customer: "Royal Restaurant",
    date: "2024-01-15",
    total: "₹21,500",
    status: "Completed",
  },
  {
    id: "ORD-2024-004",
    customer: "Grand Hotel",
    date: "2024-01-25",
    total: "₹22,500",
    status: "Active",
  },
]

const stockOverview = [
  { name: "Tissue Napkin", stock: 2500, status: "good" },
  { name: "Tissue Roll", stock: 180, status: "low" },
  { name: "Ultra Soft Tissue", stock: 3200, status: "good" },
  { name: "Aluminium Foil", stock: 45, status: "critical" },
]

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800",
  Active: "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
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
    transition: { duration: 0.4, ease: "easeOut" },
  },
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-serif text-3xl font-semibold">Admin Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Overview of your business operations
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
                <stat.icon className={`h-5 w-5 ${stat.title === "Low Stock Items" ? "text-amber-500" : "text-muted-foreground"}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{stat.value}</div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                  {stat.trend && (
                    <span className={`text-xs font-medium flex items-center gap-1 ${stat.trendUp ? "text-green-600" : "text-red-600"}`}>
                      <TrendingUp className="h-3 w-3" />
                      {stat.trend}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-serif text-xl">Recent Orders</CardTitle>
              <Link href="/admin/orders">
                <Button variant="ghost" size="sm" className="gap-1 group">
                  View All
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{order.id}</span>
                        <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{order.customer}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{order.total}</div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.date).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stock Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-serif text-xl">Stock Overview</CardTitle>
              <Link href="/admin/stock">
                <Button variant="ghost" size="sm" className="gap-1 group">
                  Manage Stock
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stockOverview.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{item.stock} units</span>
                      <Badge
                        variant={item.status === "good" ? "default" : "destructive"}
                        className={
                          item.status === "good"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : item.status === "low"
                              ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                              : "bg-red-100 text-red-800 hover:bg-red-100"
                        }
                      >
                        {item.status === "good" ? "Good" : item.status === "low" ? "Low" : "Critical"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
