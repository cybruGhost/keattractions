"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Send, User, Check, CheckCheck, Phone, Video, Info, Paperclip, ImageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  sender: "user" | "admin"
  content: string
  timestamp: Date
  read: boolean
}

interface ChatContact {
  id: string
  name: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  online: boolean
  avatar?: string
}

export default function ChatPage() {
  const router = useRouter()
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [contacts, setContacts] = useState<ChatContact[]>([])
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/profile")
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }

    fetchUserData()
  }, [])

  useEffect(() => {
    // In a real app, you'd fetch contacts and messages from an API
    // For demo purposes, we'll create some sample data
    const sampleContacts: ChatContact[] = [
      {
        id: "1",
        name: "Safari Support",
        lastMessage: "How can we help with your safari booking?",
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        unreadCount: 1,
        online: true,
      },
      {
        id: "2",
        name: "Booking Assistance",
        lastMessage: "Your booking has been confirmed.",
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        unreadCount: 0,
        online: true,
      },
      {
        id: "3",
        name: "Payment Support",
        lastMessage: "We've received your payment. Thank you!",
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        unreadCount: 0,
        online: false,
      },
    ]

    setContacts(sampleContacts)
    setSelectedContact(sampleContacts[0])

    const sampleMessages: Message[] = [
      {
        id: "1",
        sender: "admin",
        content: "Hello! Welcome to Savanak Kenya Tours. How can we assist you today?",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: true,
      },
      {
        id: "2",
        sender: "user",
        content: "Hi, I'm interested in booking a safari to Maasai Mara next month.",
        timestamp: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
        read: true,
      },
      {
        id: "3",
        sender: "admin",
        content:
          "Great choice! Maasai Mara is beautiful this time of year. How many people will be traveling and for how many days?",
        timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
        read: true,
      },
      {
        id: "4",
        sender: "user",
        content: "We are a family of 4 (2 adults, 2 children) and we're thinking of a 5-day safari.",
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        read: true,
      },
      {
        id: "5",
        sender: "admin",
        content:
          "Perfect! We have several packages that would be ideal for your family. Would you prefer luxury, standard, or budget accommodations?",
        timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
        read: true,
      },
      {
        id: "6",
        sender: "user",
        content: "We'd prefer standard accommodations. What's included in the package and what are the rates?",
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        read: true,
      },
      {
        id: "7",
        sender: "admin",
        content:
          "Our standard 5-day Maasai Mara package includes accommodation, meals, game drives, park fees, and transportation. For 2 adults and 2 children, the total cost would be $2,800. Would you like me to send you a detailed itinerary?",
        timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
        read: false,
      },
    ]

    setMessages(sampleMessages)
    setLoading(false)
  }, [])

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (!message.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: message,
      timestamp: new Date(),
      read: false,
    }

    setMessages([...messages, newMessage])
    setMessage("")

    // Simulate admin response after 2 seconds
    setTimeout(() => {
      const adminResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "admin",
        content: "Thank you for your message. Our team will get back to you shortly.",
        timestamp: new Date(),
        read: false,
      }

      setMessages((prev) => [...prev, adminResponse])
    }, 2000)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Contacts List */}
          <Card className="md:col-span-1 overflow-hidden">
            <CardHeader className="p-4">
              <CardTitle>Conversations</CardTitle>
              <CardDescription>Chat with our support team</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-1 p-2">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedContact?.id === contact.id ? "bg-primary/10" : "hover:bg-muted"
                      }`}
                      onClick={() => setSelectedContact(contact)}
                    >
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={contact.avatar} />
                          <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {contact.online && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="font-medium truncate">{contact.name}</p>
                          <p className="text-xs text-muted-foreground">{formatTime(contact.lastMessageTime)}</p>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
                      </div>
                      {contact.unreadCount > 0 && (
                        <div className="bg-primary text-primary-foreground rounded-full h-5 min-w-5 flex items-center justify-center text-xs font-medium">
                          {contact.unreadCount}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="md:col-span-2 flex flex-col">
            {selectedContact ? (
              <>
                <CardHeader className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={selectedContact.avatar} />
                        <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{selectedContact.name}</CardTitle>
                        <CardDescription>{selectedContact.online ? "Online" : "Offline"}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Phone className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Video className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Info className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 p-0 overflow-hidden">
                  <ScrollArea className="h-[calc(100vh-400px)] p-4">
                    <div className="space-y-4">
                      {messages.map((msg, index) => {
                        // Check if we need to show date separator
                        const showDate =
                          index === 0 || formatDate(messages[index - 1].timestamp) !== formatDate(msg.timestamp)

                        return (
                          <div key={msg.id}>
                            {showDate && (
                              <div className="flex justify-center my-4">
                                <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                                  {formatDate(msg.timestamp)}
                                </span>
                              </div>
                            )}

                            <div className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                              <div
                                className={`max-w-[80%] ${msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"} rounded-lg p-3`}
                              >
                                <p>{msg.content}</p>
                                <div
                                  className={`flex items-center justify-end gap-1 mt-1 text-xs ${msg.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                                >
                                  <span>{formatTime(msg.timestamp)}</span>
                                  {msg.sender === "user" &&
                                    (msg.read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </CardContent>

                <CardFooter className="p-4 border-t">
                  <div className="flex items-end gap-2 w-full">
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <ImageIcon className="h-5 w-5" />
                    </Button>
                    <Textarea
                      placeholder="Type a message..."
                      className="flex-1 min-h-10 max-h-32"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                    <Button onClick={handleSendMessage} className="rounded-full" size="icon">
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </CardFooter>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <User className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold mb-2">No conversation selected</h3>
                <p className="text-muted-foreground">Select a conversation from the list to start chatting</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

