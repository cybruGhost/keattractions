import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get total bookings
    const totalBookingsResult = await query("SELECT COUNT(*) as count FROM bookings")
    const totalBookings = (totalBookingsResult as any[])[0].count || 0

    // Get total users
    const totalUsersResult = await query("SELECT COUNT(*) as count FROM users")
    const totalUsers = (totalUsersResult as any[])[0].count || 0

    // Get total revenue
    const totalRevenueResult = await query("SELECT SUM(total_price_usd) as total FROM bookings")
    const totalRevenue = (totalRevenueResult as any[])[0].total || 0

    // Get pending bookings
    const pendingBookingsResult = await query("SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'")
    const pendingBookings = (pendingBookingsResult as any[])[0].count || 0

    // Get recent bookings
    const recentBookings = await query(`
      SELECT 
        b.*, 
        u.first_name, u.last_name, u.email,
        CASE 
          WHEN b.booking_type = 'attraction' THEN (SELECT name FROM attractions WHERE id = b.item_id)
          WHEN b.booking_type = 'safari' THEN (SELECT name FROM safaris WHERE id = b.item_id)
        END as item_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
      LIMIT 5
    `)

    // Get top attractions
    const topAttractions = await query(`
      SELECT 
        a.id, 
        a.name, 
        COUNT(b.id) as bookings
      FROM attractions a
      LEFT JOIN bookings b ON a.id = b.item_id AND b.booking_type = 'attraction'
      GROUP BY a.id
      ORDER BY bookings DESC
      LIMIT 5
    `)

    return NextResponse.json({
      totalBookings,
      totalUsers,
      totalRevenue,
      pendingBookings,
      recentBookings,
      topAttractions,
    })
  } catch (error) {
    console.error("Dashboard error:", error)
    return NextResponse.json({ error: "An error occurred while fetching dashboard data" }, { status: 500 })
  }
}

