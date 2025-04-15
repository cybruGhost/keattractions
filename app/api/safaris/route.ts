import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { query } from "@/lib/db"

// Function to get safaris data from MySQL database
async function getSafarisData(id?: string) {
  try {
    let sql = `
      SELECT * FROM safaris
    `
    const params = []

    if (id) {
      sql += " WHERE id = ?"
      params.push(id)
    }

    sql += " ORDER BY name ASC"

    const safaris = (await query(sql, params)) as any[]
    return safaris
  } catch (error) {
    console.error("Error fetching safaris from database:", error)
    throw error
  }
}

export async function GET(request: Request) {
  // Get the URL from the request
  const url = new URL(request.url)

  try {
    // Check if there's an ID parameter
    const id = url.searchParams.get("id")

    if (id) {
      // Return a specific safari
      const safaris = await getSafarisData(id)

      if (!safaris || safaris.length === 0) {
        return NextResponse.json({ error: "Safari not found" }, { status: 404 })
      }

      return NextResponse.json(safaris[0])
    }

    // Return all safaris
    const safaris = await getSafarisData()
    return NextResponse.json(safaris)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST method to create a new safari
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Generate a unique ID
    const safariId = uuidv4()

    // Process arrays
    const included = Array.isArray(body.included) ? JSON.stringify(body.included) : "[]"
    const notIncluded = Array.isArray(body.notIncluded) ? JSON.stringify(body.notIncluded) : "[]"
    const gallery = Array.isArray(body.gallery) ? JSON.stringify(body.gallery) : "[]"

    // Insert new safari - using image_url instead of image
    await query(
      `INSERT INTO safaris (
        id, name, location, description, image_url, 
        priceUSD, priceKES, featured, duration, itinerary,
        included, not_included, gallery
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        safariId,
        body.name,
        body.location,
        body.description,
        body.image || "/placeholder.svg", // This will now go into image_url
        body.priceUSD || 0,
        body.priceKES || 0,
        body.featured ? 1 : 0,
        body.duration || 1,
        body.itinerary || "",
        included,
        notIncluded,
        gallery,
      ],
    )

    return NextResponse.json({ success: true, id: safariId }, { status: 201 })
  } catch (error) {
    console.error("Error creating safari:", error)
    return NextResponse.json({ error: "Failed to create safari", details: error }, { status: 500 })
  }
}

// Also update the PUT method to use image_url
export async function PUT(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const body = await request.json()

    // Process arrays
    const included = Array.isArray(body.included) ? JSON.stringify(body.included) : "[]"
    const notIncluded = Array.isArray(body.notIncluded) ? JSON.stringify(body.notIncluded) : "[]"
    const gallery = Array.isArray(body.gallery) ? JSON.stringify(body.gallery) : "[]"

    // Update safari - using image_url instead of image
    await query(
      `UPDATE safaris SET
        name = ?, location = ?, description = ?, image_url = ?,
        priceUSD = ?, priceKES = ?, featured = ?, duration = ?, itinerary = ?,
        included = ?, not_included = ?, gallery = ?
      WHERE id = ?`,
      [
        body.name,
        body.location,
        body.description,
        body.image || "/placeholder.svg", // This will now go into image_url
        body.priceUSD || 0,
        body.priceKES || 0,
        body.featured ? 1 : 0,
        body.duration || 1,
        body.itinerary || "",
        included,
        notIncluded,
        gallery,
        id,
      ],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating safari:", error)
    return NextResponse.json({ error: "Failed to update safari", details: error }, { status: 500 })
  }
}

// DELETE method to delete a safari
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    // Delete safari
    await query("DELETE FROM safaris WHERE id = ?", [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting safari:", error)
    return NextResponse.json({ error: "Failed to delete safari" }, { status: 500 })
  }
}

