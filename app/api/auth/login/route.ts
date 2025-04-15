import { NextResponse } from "next/server"
import { login } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const result = await login(email, password)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 })
    }

    return NextResponse.json({ success: true, user: result.user })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "An error occurred during login" }, { status: 500 })
  }
}

