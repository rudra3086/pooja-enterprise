"use client"

import { useMemo, useRef, useState } from "react"
import { Loader2, MessageCircle, Moon, Send, Sparkles, Sun, X } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

type ChatRole = "user" | "assistant"

type ChatMessage = {
  role: ChatRole
  content: string
}

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I’m Pooja Enterprise assistant. Ask about products, bulk orders, customization, or delivery.",
}

export function HomeChatbot() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE])
  const viewportRef = useRef<HTMLDivElement | null>(null)

  const canSend = useMemo(() => input.trim().length > 0 && !sending, [input, sending])
  const isDark = theme === "dark"

  const scrollToBottom = () => {
    window.requestAnimationFrame(() => {
      if (viewportRef.current) {
        viewportRef.current.scrollTop = viewportRef.current.scrollHeight
      }
    })
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || sending) return

    const nextMessages = [...messages, { role: "user" as const, content: text }]
    setMessages(nextMessages)
    setInput("")
    setSending(true)
    scrollToBottom()

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: nextMessages.slice(-8),
        }),
      })

      const data = await response.json()
      if (!response.ok || !data?.success || !data?.data?.reply) {
        throw new Error(data?.error || "Failed to get reply")
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.data.reply }])
      scrollToBottom()
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't respond right now. Please try again in a moment.",
        },
      ])
      scrollToBottom()
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[2100] cursor-auto [&_*]:cursor-auto">
      {open && (
        <Card className="mb-3 w-[22rem] shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Assistant
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ScrollArea className="h-72 rounded-md border border-border">
              <div ref={viewportRef} className="space-y-3 p-3">
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={cn(
                      "max-w-[86%] rounded-lg px-3 py-2 text-sm leading-relaxed",
                      message.role === "user"
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {message.content}
                  </div>
                ))}
                {sending && (
                  <div className="inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking...
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Input
                className="cursor-text caret-foreground"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    sendMessage()
                  }
                }}
                placeholder="Ask anything..."
                disabled={sending}
              />
              <Button size="icon" onClick={sendMessage} disabled={!canSend} aria-label="Send message">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="inline-flex items-center overflow-hidden rounded-full border border-border bg-background shadow-lg">
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          className="h-11 w-11 rounded-none"
          onClick={() => setOpen((previous) => !previous)}
          aria-label={open ? "Close bot" : "Open bot"}
          title={open ? "Close bot" : "Open bot"}
        >
          {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        </Button>

        <button
          type="button"
          className={`inline-flex h-11 w-11 items-center justify-center ${isDark ? "bg-white text-black" : "bg-black text-white"}`}
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
