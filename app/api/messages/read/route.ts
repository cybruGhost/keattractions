import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { markMessagesAsRead } from "@/lib/chat-server"

export async function POST(request: Request) {
  const url = new URL(request.url)
  const userId = url.searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Mark messages from this user as read
    await markMessagesAsRead(user.id, userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking messages as read:", error)
    return NextResponse.json({ error: "Failed to mark messages as read" }, { status: 500 })
  }
}

