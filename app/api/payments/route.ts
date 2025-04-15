import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId, amount, paymentType, paymentMethod } = body

    if (!bookingId || !amount || !paymentType || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate payment type
    if (paymentType !== "deposit" && paymentType !== "final") {
      return NextResponse.json({ error: "Invalid payment type" }, { status: 400 })
    }

    // Check if booking exists and belongs to the user
    const booking = await query("SELECT * FROM bookings WHERE id = ? AND user_id = ?", [bookingId, user.id])

    if (!booking || (booking as any[]).length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Generate a unique payment ID
    const paymentId = uuidv4()

    // Insert payment record
    await query(
      `INSERT INTO payments (
        id, booking_id, user_id, amount, payment_type, payment_method, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [paymentId, bookingId, user.id, amount, paymentType, paymentMethod, "completed", new Date()],
    )

    // Update booking payment status
    if (paymentType === "deposit") {
      await query("UPDATE bookings SET deposit_paid = ?, payment_status = ? WHERE id = ?", [
        1,
        "partially_paid",
        bookingId,
      ])
    } else if (paymentType === "final") {
      await query("UPDATE bookings SET payment_status = ? WHERE id = ?", ["paid", bookingId])
    }

    return NextResponse.json(
      {
        success: true,
        paymentId,
        message: `${paymentType === "deposit" ? "Deposit" : "Final payment"} processed successfully`,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Payment error:", error)
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const url = new URL(request.url)
    const bookingId = url.searchParams.get("bookingId")

    let payments

    if (bookingId) {
      // Get payments for a specific booking
      payments = await query("SELECT * FROM payments WHERE booking_id = ? AND user_id = ? ORDER BY created_at DESC", [
        bookingId,
        user.id,
      ])
    } else {
      // Get all payments for the user
      payments = await query("SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC", [user.id])
    }

    return NextResponse.json(payments)
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}

