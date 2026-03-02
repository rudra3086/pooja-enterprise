"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Mail, Reply, Clock, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { ContactMessage } from "@/lib/types"

export default function AdminMessagesPage() {
  const { toast } = useToast()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "replied">("all")
  const [search, setSearch] = useState("")
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [replyText, setReplyText] = useState("")
  const [replying, setReplying] = useState(false)
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null)
  const [bulkDeleting, setBulkDeleting] = useState<"all" | "replied" | null>(null)

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)
      params.set("pageSize", "100")

      const response = await fetch(`/api/admin/contact?${params.toString()}`)
      const data = await response.json()

      if (data.success && data.data?.data) {
        setMessages(data.data.data)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch messages",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch messages",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [statusFilter])

  const filteredMessages = messages.filter((m) => {
    const query = search.toLowerCase()
    return (
      m.name.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query) ||
      m.subject.toLowerCase().includes(query)
    )
  })

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return

    try {
      setReplying(true)
      const response = await fetch(`/api/admin/contact/${selectedMessage.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: replyText }),
      })
      const data = await response.json()

      if (data.success) {
        toast({ title: "Reply sent", description: "Email reply sent to customer." })
        setSelectedMessage(null)
        setReplyText("")
        fetchMessages()
      } else {
        toast({ title: "Error", description: data.error || "Failed to send reply", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to send reply", variant: "destructive" })
    } finally {
      setReplying(false)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    const confirmed = window.confirm("Delete this inquiry permanently?")
    if (!confirmed) return

    try {
      setDeletingMessageId(messageId)
      const response = await fetch(`/api/admin/contact/${messageId}`, {
        method: "DELETE",
      })
      const data = await response.json()

      if (data.success) {
        setMessages((prev) => prev.filter((message) => message.id !== messageId))
        toast({ title: "Inquiry deleted", description: "The inquiry has been removed." })
      } else {
        toast({ title: "Error", description: data.error || "Failed to delete inquiry", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete inquiry", variant: "destructive" })
    } finally {
      setDeletingMessageId(null)
    }
  }

  const handleBulkDelete = async (scope: "all" | "replied") => {
    const label = scope === "all" ? "all inquiries" : "all replied inquiries"
    const confirmed = window.confirm(`Delete ${label} permanently?`)
    if (!confirmed) return

    try {
      setBulkDeleting(scope)
      const response = await fetch(`/api/admin/contact?scope=${scope}`, {
        method: "DELETE",
      })
      const data = await response.json()

      if (data.success) {
        toast({
          title: "Cleanup completed",
          description: `${data.data?.deletedCount ?? 0} inquiry(s) deleted.`,
        })
        fetchMessages()
      } else {
        toast({ title: "Error", description: data.error || "Failed to delete inquiries", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete inquiries", variant: "destructive" })
    } finally {
      setBulkDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-serif text-3xl font-semibold">New Messages</h1>
        <p className="mt-1 text-muted-foreground">Review contact form inquiries and reply by email.</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search by name, email, subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | "new" | "replied") }>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="replied">Replied</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={() => handleBulkDelete("replied")}
          disabled={bulkDeleting !== null || loading}
        >
          <Trash2 className="h-4 w-4" />
          {bulkDeleting === "replied" ? "Deleting..." : "Delete Replied Inquiries"}
        </Button>
        <Button
          variant="outline"
          className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={() => handleBulkDelete("all")}
          disabled={bulkDeleting !== null || loading}
        >
          <Trash2 className="h-4 w-4" />
          {bulkDeleting === "all" ? "Deleting..." : "Delete All Inquiries"}
        </Button>
      </div>

      {loading ? (
        <Card><CardContent className="p-6 text-muted-foreground">Loading messages...</CardContent></Card>
      ) : filteredMessages.length === 0 ? (
        <Card><CardContent className="p-6 text-muted-foreground">No messages found.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <Card key={message.id}>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {message.subject}
                  </div>
                  <Badge className={message.status === "new" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
                    {message.status === "new" ? "New" : "Replied"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <p><strong>Name:</strong> {message.name}</p>
                  <p><strong>Email:</strong> {message.email}</p>
                  {message.company && <p><strong>Company:</strong> {message.company}</p>}
                  {message.phone && <p><strong>Phone:</strong> {message.phone}</p>}
                  <p className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(message.createdAt).toLocaleString("en-IN")}</p>
                </div>

                <div className="rounded-md bg-muted p-3 text-sm">{message.message}</div>

                {message.adminReply && (
                  <div className="rounded-md border border-border p-3 text-sm">
                    <p className="font-medium mb-1">Reply Sent:</p>
                    <p>{message.adminReply}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {!message.adminReply && (
                    <Button size="sm" className="gap-2" onClick={() => { setSelectedMessage(message); setReplyText("") }}>
                      <Reply className="h-4 w-4" />
                      Reply
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleDeleteMessage(message.id)}
                    disabled={deletingMessageId === message.id}
                  >
                    <Trash2 className="h-4 w-4" />
                    {deletingMessageId === message.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Reply to {selectedMessage?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">This reply will be sent to {selectedMessage?.email}</p>
            <Textarea
              rows={7}
              placeholder="Type your reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedMessage(null)}>Cancel</Button>
            <Button onClick={handleReply} disabled={!replyText.trim() || replying}>
              {replying ? "Sending..." : "Send Reply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
