import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { query } from "@/lib/db"

// Function to get bookings data from MySQL database
async function getBookingsData(userId?: string) {
  try {
    let sql = `
    SELECT 
      b.*, 
      u.first_name, u.last_name, u.email, u.phone_number,
      CASE 
        WHEN b.booking_type = 'attraction' THEN (SELECT name FROM attractions WHERE id = b.item_id)
        WHEN b.booking_type = 'safari' THEN (SELECT name FROM safaris WHERE id = b.item_id)
      END as item_name
    FROM bookings b
    JOIN users u ON b.user_id = u.id
  `

    const params = []

    if (userId) {
      sql += " WHERE b.user_id = ?"
      params.push(userId)
    }

    sql += " ORDER BY b.created_at DESC"

    const bookings = (await query(sql, params)) as any[]
    return bookings
  } catch (error) {
    console.error("Error fetching bookings from database:", error)
    throw error
  }
}

export async function GET(request: Request) {
  // Get the URL from the request
  const url = new URL(request.url)

  try {
    // Check if there's an ID parameter
    const id = url.searchParams.get("id")
    const userId = url.searchParams.get("userId")

    if (id) {
      // Return a specific booking
      const booking = (await query(
        `SELECT 
        b.*, 
        u.first_name, u.last_name, u.email, u.phone_number,
        CASE 
          WHEN b.booking_type = 'attraction' THEN (SELECT name FROM attractions WHERE id = b.item_id)
          WHEN b.booking_type = 'safari' THEN (SELECT name FROM safaris WHERE id = b.item_id)
        END as item_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.id = ?`,
        [id],
      )) as any[]

      if (!booking || booking.length === 0) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 })
      }

      return NextResponse.json(booking[0])
    }

    // Return all bookings or bookings for a specific user
    const bookings = await getBookingsData(userId || undefined)
    return NextResponse.json(bookings)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST method to create a new booking
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Generate a unique ID
    const bookingId = uuidv4()

    // Validate payment_status to ensure it matches the ENUM values
    // Valid values are likely: 'unpaid', 'paid', 'refunded'
    // 'partially_paid' might not be in the ENUM definition
    const validPaymentStatuses = ["unpaid", "paid", "refunded"]
    const paymentStatus = validPaymentStatuses.includes(body.paymentStatus) ? body.paymentStatus : "unpaid" // Default to unpaid if invalid

    // Validate status to ensure it matches the ENUM values
    // Valid values: 'pending', 'confirmed', 'cancelled'
    const validStatuses = ["pending", "confirmed", "cancelled"]
    const status = validStatuses.includes(body.status) ? body.status : "confirmed" // Default to confirmed if invalid

    // Insert new booking
    const result = await query(
      `INSERT INTO bookings (
        id, user_id, booking_type, item_id, booking_date, travel_date,
        adults, children, accommodation_type, special_requests,
        total_price_usd, total_price_kes, deposit_amount, deposit_paid,
        status, payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bookingId,
        body.userId, // Make sure this matches what's sent from the client
        body.bookingType,
        body.itemId,
        new Date(),
        body.travelDate,
        body.adults,
        body.children,
        body.accommodationType,
        body.specialRequests,
        body.totalPriceUSD,
        body.totalPriceKES,
        body.depositAmount,
        body.depositPaid ? 1 : 0,
        status,
        paymentStatus,
      ],
    )

    return NextResponse.json({ success: true, id: bookingId }, { status: 201 })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}

// PUT method to update a booking
export async function PUT(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const body = await request.json()

    // Validate payment_status to ensure it matches the ENUM values
    const validPaymentStatuses = ["unpaid", "paid", "refunded"]
    const paymentStatus = validPaymentStatuses.includes(body.paymentStatus) ? body.paymentStatus : "unpaid"

    // Validate status to ensure it matches the ENUM values
    const validStatuses = ["pending", "confirmed", "cancelled"]
    const status = validStatuses.includes(body.status) ? body.status : "confirmed"

    // Update booking
    await query(
      `UPDATE bookings SET
        travel_date = ?, adults = ?, children = ?, accommodation_type = ?,
        special_requests = ?, total_price_usd = ?, total_price_kes = ?,
        deposit_amount = ?, deposit_paid = ?, status = ?, payment_status = ?
      WHERE id = ?`,
      [
        body.travelDate,
        body.adults,
        body.children,
        body.accommodationType,
        body.specialRequests,
        body.totalPriceUSD,
        body.totalPriceKES,
        body.depositAmount,
        body.depositPaid ? 1 : 0,
        status,
        paymentStatus,
        id,
      ],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}

// DELETE method to delete a booking
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    // Delete booking
    await query("DELETE FROM bookings WHERE id = ?", [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting booking:", error)
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 })
  }
}

