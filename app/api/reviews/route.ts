import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const attractionId = url.searchParams.get("attractionId")

  if (!attractionId) {
    return NextResponse.json({ error: "Attraction ID is required" }, { status: 400 })
  }

  try {
    const reviews = await query(
      `SELECT r.*, u.first_name, u.last_name 
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.attraction_id = ?
       ORDER BY r.created_at DESC`,
      [attractionId],
    )

    return NextResponse.json(reviews)
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { attractionId, rating, comment } = body

    if (!attractionId || !rating) {
      return NextResponse.json({ error: "Attraction ID and rating are required" }, { status: 400 })
    }

    // Check if user has already reviewed this attraction
    const existingReview = await query("SELECT id FROM reviews WHERE user_id = ? AND attraction_id = ?", [
      user.id,
      attractionId,
    ])

    if ((existingReview as any[]).length > 0) {
      // Update existing review
      await query(
        `UPDATE reviews 
         SET rating = ?, comment = ?, updated_at = NOW() 
         WHERE user_id = ? AND attraction_id = ?`,
        [rating, comment || "", user.id, attractionId],
      )
    } else {
      // Create new review
      const reviewId = uuidv4()
      await query(
        `INSERT INTO reviews (id, user_id, attraction_id, rating, comment, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [reviewId, user.id, attractionId, rating, comment || ""],
      )
    }

    // Update attraction average rating
    await query(
      `UPDATE attractions 
       SET rating = (SELECT AVG(rating) FROM reviews WHERE attraction_id = ?),
           reviews = (SELECT COUNT(*) FROM reviews WHERE attraction_id = ?)
       WHERE id = ?`,
      [attractionId, attractionId, attractionId],
    )

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("Error creating/updating review:", error)
    return NextResponse.json({ error: "Failed to save review" }, { status: 500 })
  }
}

