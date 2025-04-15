import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getUserChats, getAdminChats } from "@/lib/chat-server"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    let chats

    if (user.role === "admin") {
      // Admin gets all user chats
      chats = await getAdminChats()
    } else {
      // Regular user gets their own chats
      chats = await getUserChats(user.id)
    }

    return NextResponse.json(chats)
  } catch (error) {
    console.error("Error fetching chat users:", error)
    return NextResponse.json({ error: "Failed to fetch chat users" }, { status: 500 })
  }
}

