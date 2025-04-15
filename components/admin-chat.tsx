"use client"

import { useState, useEffect, useRef } from "react"
import { Send, User, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface Message {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  created_at: string
  read: boolean
  sender_name?: string
  sender_role?: string
}

interface ChatUser {
  id: string
  first_name: string
  last_name: string
  role: string
  unread_count: number
  last_message: string
  last_message_time: string
}

export function AdminChat() {
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<ChatUser[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/messages/users")

        if (!response.ok) {
          throw new Error("Failed to fetch users")
        }

        const data = await response.json()
        setUsers(data)

        // Select the first user if none is selected
        if (data.length > 0 && !selectedUser) {
          setSelectedUser(data[0])
        }
      } catch (error) {
        console.error("Error fetching users:", error)
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()

    // Poll for new users every 30 seconds
    const interval = setInterval(fetchUsers, 30000)

    return () => clearInterval(interval)
  }, [toast, selectedUser])

  useEffect(() => {
    if (!selectedUser) return

    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages?userId=${selectedUser.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch messages")
        }

        const data = await response.json()
        setMessages(data)

        // Mark messages as read
        await fetch(`/api/messages/read?userId=${selectedUser.id}`, {
          method: "POST",
        })

        // Update unread count for this user
        setUsers(users.map((user) => (user.id === selectedUser.id ? { ...user, unread_count: 0 } : user)))
      } catch (error) {
        console.error("Error fetching messages:", error)
      }
    }

    fetchMessages()

    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000)

    return () => clearInterval(interval)
  }, [selectedUser, users])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedUser) return

    setSending(true)

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientId: selectedUser.id,
          content: message,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      // Add the new message to the list
      const newMessage: Message = {
        id: Date.now().toString(), // Temporary ID
        sender_id: "admin",
        recipient_id: selectedUser.id,
        content: message,
        created_at: new Date().toISOString(),
        read: false,
        sender_name: "Admin",
        sender_role: "admin",
      }

      setMessages([...messages, newMessage])
      setMessage("")

      // Update last message for this user
      setUsers(
        users.map((user) =>
          user.id === selectedUser.id
            ? {
                ...user,
                last_message: message,
                last_message_time: new Date().toISOString(),
              }
            : user,
        ),
      )
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

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase()
    return fullName.includes(searchQuery.toLowerCase())
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
      <Card className="md:col-span-1 overflow-hidden">
        <CardHeader className="p-4">
          <CardTitle>Conversations</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">No conversations found</div>
            ) : (
              <div className="space-y-1">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                      selectedUser?.id === user.id ? "bg-primary/10" : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <Avatar>
                      <AvatarFallback>
                        {user.first_name[0]}
                        {user.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="font-medium truncate">
                          {user.first_name} {user.last_name}
                        </p>
                        {user.last_message_time && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(user.last_message_time).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {user.last_message && (
                        <p className="text-sm text-muted-foreground truncate">{user.last_message}</p>
                      )}
                    </div>
                    {user.unread_count > 0 && (
                      <Badge variant="default" className="ml-auto">
                        {user.unread_count}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 flex flex-col">
        {selectedUser ? (
          <>
            <CardHeader className="p-4 border-b">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {selectedUser.first_name[0]}
                    {selectedUser.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">User</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 flex-1 flex flex-col">
              <ScrollArea className="flex-1 p-4">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isAdmin = msg.sender_id === "admin"

                      return (
                        <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              isAdmin ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                          >
                            {!isAdmin && (
                              <div className="flex items-center gap-2 mb-1">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback>
                                    {selectedUser.first_name[0]}
                                    {selectedUser.last_name[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-medium">
                                  {selectedUser.first_name} {selectedUser.last_name}
                                </span>
                              </div>
                            )}
                            <p>{msg.content}</p>
                            <p
                              className={`text-xs mt-1 text-right ${
                                isAdmin ? "text-primary-foreground/70" : "text-muted-foreground"
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

              <div className="p-4 border-t mt-auto">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 min-h-10 max-h-32"
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
            </CardContent>
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
  )
}

