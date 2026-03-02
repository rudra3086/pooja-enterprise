"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Mail, Reply, Clock } from "lucide-react"
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

                {message.adminReply ? (
                  <div className="rounded-md border border-border p-3 text-sm">
                    <p className="font-medium mb-1">Reply Sent:</p>
                    <p>{message.adminReply}</p>
                  </div>
                ) : (
                  <Button size="sm" className="gap-2" onClick={() => { setSelectedMessage(message); setReplyText("") }}>
                    <Reply className="h-4 w-4" />
                    Reply
                  </Button>
                )}
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
