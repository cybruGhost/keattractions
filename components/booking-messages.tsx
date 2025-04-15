"use client"

import { useState, useEffect, useRef } from "react"
import { Send, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

interface Message {
  id: string
  sender_id: string
  recipient_id: string
  booking_id: string
  content: string
  created_at: string
  read: boolean
  first_name: string
  last_name: string
  role: string
}

interface BookingMessagesProps {
  bookingId: string
  userId: string
  isAdmin: boolean
}

export function BookingMessages({ bookingId, userId, isAdmin }: BookingMessagesProps) {
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages?bookingId=${bookingId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch messages")
        }

        const data = await response.json()
        setMessages(data)
      } catch (error) {
        console.error("Error fetching messages:", error)
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()

    // Poll for new messages every 30 seconds
    const interval = setInterval(fetchMessages, 30000)

    return () => clearInterval(interval)
  }, [bookingId, toast])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!message.trim()) return

    setSending(true)

    try {
      const recipientId = isAdmin ? userId : "admin" // Simplified for demo

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientId,
          bookingId,
          content: message,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      // Add the new message to the list
      const newMessage: Message = {
        id: Date.now().toString(), // Temporary ID
        sender_id: isAdmin ? "admin" : userId,
        recipient_id: isAdmin ? userId : "admin",
        booking_id: bookingId,
        content: message,
        created_at: new Date().toISOString(),
        read: false,
        first_name: "You", // Will be replaced when fetching
        last_name: "",
        role: isAdmin ? "admin" : "customer",
      }

      setMessages([...messages, newMessage])
      setMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Send Failed",
        description: "Failed to send your message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[400px]">
      <ScrollArea className="flex-1 p-4 border rounded-lg mb-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isCurrentUser = (isAdmin && msg.role === "admin") || (!isAdmin && msg.role !== "admin")

              return (
                <div key={msg.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {!isCurrentUser && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="bg-background h-6 w-6 rounded-full flex items-center justify-center">
                          <User className="h-3 w-3" />
                        </div>
                        <span className="text-xs font-medium">
                          {msg.first_name} {msg.last_name} ({msg.role})
                        </span>
                      </div>
                    )}
                    <p>{msg.content}</p>
                    <p
                      className={`text-xs mt-1 text-right ${
                        isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      <div className="flex gap-2">
        <Textarea
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 min-h-10"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSendMessage()
            }
          }}
        />
        <Button onClick={handleSendMessage} disabled={sending || !message.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

