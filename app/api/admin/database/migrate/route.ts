import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { migration } = body

    if (!migration) {
      return NextResponse.json({ error: "Migration SQL is required" }, { status: 400 })
    }

    // Execute the migration SQL
    await query(migration, [])

    return NextResponse.json({ success: true, message: "Migration executed successfully" })
  } catch (error) {
    console.error("Migration error:", error)
    return NextResponse.json({ error: "Failed to execute migration", details: error }, { status: 500 })
  }
}

