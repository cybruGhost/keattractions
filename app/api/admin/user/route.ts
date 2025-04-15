import { NextResponse } from "next/server"
import { getCurrentAdminUser } from "@/lib/admin-auth"

export async function GET() {
  try {
    const user = await getCurrentAdminUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Admin auth error:", error)
    return NextResponse.json({ error: "An error occurred while fetching admin data" }, { status: 500 })
  }
}

