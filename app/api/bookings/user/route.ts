import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "@/lib/db"
import { verifyJwtToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Get the token from cookies
    const cookieStore = cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify the token
    const payload = await verifyJwtToken(token)

    if (!payload || !payload.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Fetch user's bookings with item names
    const bookings = (await query(
      `SELECT b.*, 
        CASE 
          WHEN b.booking_type = 'attraction' THEN a.name
          WHEN b.booking_type = 'safari' THEN s.name
          ELSE 'Unknown'
        END as item_name
       FROM bookings b
       LEFT JOIN attractions a ON b.booking_type = 'attraction' AND b.item_id = a.id
       LEFT JOIN safaris s ON b.booking_type = 'safari' AND b.item_id = s.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [payload.id],
    )) as any[]

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching user bookings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

