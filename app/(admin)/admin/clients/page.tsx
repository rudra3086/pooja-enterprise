import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Users, TrendingUp, Package } from "lucide-react"
import { getClients, getOrders } from "@/lib/db"

export default async function AdminClientsPage() {
  try {
    // Fetch all clients from database
    const { clients } = await getClients()
    
    // Fetch all orders to calculate stats
    const { orders } = await getOrders()
    
    // Calculate totals
    const totalClients = clients.length
    const activeClients = clients.filter((c) => c.status === "approved").length
    
    // Calculate revenue by client
    const clientStats = clients.map((client) => {
      const clientOrders = orders.filter((o) => o.clientId === client.id)
      const totalSpent = clientOrders
        .filter((o) => o.paymentStatus === "paid")
        .reduce((sum, o) => sum + o.totalAmount, 0)
      
      return {
        ...client,
        totalOrders: clientOrders.length,
        totalSpent,
      }
    })
    
    const totalRevenue = clientStats.reduce((sum, c) => sum + c.totalSpent, 0)
    const totalOrdersCount = clientStats.reduce((sum, c) => sum + c.totalOrders, 0)

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div>
          <h1 className="font-serif text-3xl font-semibold text-foreground">
            Client Management
          </h1>
          <p className="mt-2 text-muted-foreground">
            View and manage all registered clients
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Clients
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{totalClients}</div>
              <p className="text-xs text-muted-foreground">
                {activeClients} approved
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                Rs. {totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                From all clients
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Orders
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{totalOrdersCount}</div>
              <p className="text-xs text-muted-foreground">
                Across all clients
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Clients Table */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>All Clients ({clientStats.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {clientStats.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No clients registered yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientStats.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.email}</TableCell>
                      <TableCell>{client.businessName}</TableCell>
                      <TableCell>{client.contactPerson}</TableCell>
                      <TableCell>
                        <Badge
                          variant={client.status === "approved" ? "default" : "secondary"}
                          className={
                            client.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : client.status === "suspended"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {client.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{client.totalOrders}</TableCell>
                      <TableCell>Rs. {client.totalSpent.toLocaleString()}</TableCell>
                      <TableCell>
                        {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    )
  } catch (error) {
    console.error("Error loading clients:", error)
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground">Error Loading Clients</h2>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    )
  }
}
