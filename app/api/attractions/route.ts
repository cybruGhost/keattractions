import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// Function to get attractions data from MySQL database
async function getAttractionsData(id?: string) {
  try {
    let sql = `
      SELECT * FROM attractions
    `
    const params = []

    if (id) {
      sql += " WHERE id = ?"
      params.push(id)
    }

    sql += " ORDER BY name ASC"

    const attractions = (await query(sql, params)) as any[]
    return attractions
  } catch (error) {
    console.error("Error fetching attractions from database:", error)
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
      // Return a specific attraction
      const attractions = await getAttractionsData(id)

      if (!attractions || attractions.length === 0) {
        return NextResponse.json({ error: "Attraction not found" }, { status: 404 })
      }

      return NextResponse.json(attractions[0])
    }

    // Return all attractions
    const attractions = await getAttractionsData()
    return NextResponse.json(attractions)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST method to create a new attraction
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Get the next available ID (auto-increment)
    // We'll let MySQL handle the ID generation with AUTO_INCREMENT

    // Insert new attraction
    const result = await query(
      `INSERT INTO attractions (
        name, location, image, rating, reviews, 
        priceUSD, priceKES, featured, category, description, 
        longDescription, bestTimeToVisit, duration, 
        lat, lng, gallery, activities, included, notIncluded
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.name,
        body.location,
        body.image && body.image.length > 255 ? "/placeholder.svg" : body.image || "/placeholder.svg", // Prevent oversized URLs
        body.rating || 0,
        body.reviews || 0,
        body.priceUSD || 0,
        body.priceKES || 0,
        body.featured ? 1 : 0,
        body.category || "General",
        body.description || "",
        body.longDescription || "",
        body.bestTimeToVisit || "",
        body.duration || 0,
        body.lat || 0,
        body.lng || 0,
        JSON.stringify(body.gallery || []),
        JSON.stringify(body.activities || []),
        JSON.stringify(body.included || []),
        JSON.stringify(body.notIncluded || []),
      ],
    )

    // Get the inserted ID
    const insertId = (result as any).insertId

    return NextResponse.json({ success: true, id: insertId }, { status: 201 })
  } catch (error) {
    console.error("Error creating attraction:", error)
    return NextResponse.json({ error: "Failed to create attraction", details: error }, { status: 500 })
  }
}

// PUT method to update an attraction
export async function PUT(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const body = await request.json()

    // Update attraction
    await query(
      `UPDATE attractions SET
        name = ?, location = ?, image = ?, rating = ?, reviews = ?,
        priceUSD = ?, priceKES = ?, featured = ?, category = ?, description = ?,
        longDescription = ?, bestTimeToVisit = ?, duration = ?,
        lat = ?, lng = ?, gallery = ?, activities = ?, included = ?, notIncluded = ?
      WHERE id = ?`,
      [
        body.name,
        body.location,
        body.image && body.image.length > 255 ? "/placeholder.svg" : body.image || "/placeholder.svg", // Prevent oversized URLs
        body.rating || 0,
        body.reviews || 0,
        body.priceUSD || 0,
        body.priceKES || 0,
        body.featured ? 1 : 0,
        body.category || "General",
        body.description || "",
        body.longDescription || "",
        body.bestTimeToVisit || "",
        body.duration || 0,
        body.lat || 0,
        body.lng || 0,
        JSON.stringify(body.gallery || []),
        JSON.stringify(body.activities || []),
        JSON.stringify(body.included || []),
        JSON.stringify(body.notIncluded || []),
        id,
      ],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating attraction:", error)
    return NextResponse.json({ error: "Failed to update attraction", details: error }, { status: 500 })
  }
}

// DELETE method to delete an attraction
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    // Delete attraction
    await query("DELETE FROM attractions WHERE id = ?", [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting attraction:", error)
    return NextResponse.json({ error: "Failed to delete attraction" }, { status: 500 })
  }
}

