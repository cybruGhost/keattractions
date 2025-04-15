import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const id = url.searchParams.get("id")
  const location = url.searchParams.get("location")

  if (!id || !location) {
    return NextResponse.json({ error: "ID and location are required" }, { status: 400 })
  }

  try {
    // Find attractions with the same location, excluding the current one
    const attractions = await query(
      `SELECT * FROM attractions 
       WHERE id != ? AND (location = ? OR category IN 
         (SELECT category FROM attractions WHERE id = ?))
       ORDER BY RAND() 
       LIMIT 3`,
      [id, location, id],
    )

    return NextResponse.json(attractions)
  } catch (error) {
    console.error("Error fetching similar attractions:", error)
    return NextResponse.json({ error: "Failed to fetch similar attractions" }, { status: 500 })
  }
}

