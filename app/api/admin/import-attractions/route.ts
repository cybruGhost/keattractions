import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Read the file content
    const fileContent = await file.text()

    // Parse CSV
    const lines = fileContent.split("\n")
    const headers = lines[0].split(",").map((header) => header.trim())

    // Validate required headers
    const requiredHeaders = ["name", "location", "description", "priceUSD", "priceKES", "category", "image"]
    const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header))

    if (missingHeaders.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required headers: ${missingHeaders.join(", ")}`,
        },
        { status: 400 },
      )
    }

    // Process data rows
    const attractions = []

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue

      const values = lines[i].split(",").map((value) => value.trim())

      if (values.length !== headers.length) {
        console.warn(`Skipping row ${i}: column count mismatch`)
        continue
      }

      const attraction: Record<string, any> = {
        id: uuidv4(),
      }

      headers.forEach((header, index) => {
        attraction[header] = values[index]
      })

      // Convert numeric values
      if (attraction.priceUSD) attraction.priceUSD = Number.parseFloat(attraction.priceUSD)
      if (attraction.priceKES) attraction.priceKES = Number.parseFloat(attraction.priceKES)
      if (attraction.rating) attraction.rating = Number.parseFloat(attraction.rating)
      if (attraction.reviews) attraction.reviews = Number.parseInt(attraction.reviews)
      if (attraction.lat) attraction.lat = Number.parseFloat(attraction.lat)
      if (attraction.lng) attraction.lng = Number.parseFloat(attraction.lng)
      if (attraction.featured) attraction.featured = attraction.featured.toLowerCase() === "true"

      // Handle JSON fields
      if (attraction.gallery) {
        try {
          attraction.gallery = JSON.parse(attraction.gallery)
        } catch {
          // If not valid JSON, try to split by semicolon
          attraction.gallery = attraction.gallery.split(";").map((url: string) => url.trim())
        }
      } else {
        attraction.gallery = []
      }

      if (attraction.activities) {
        try {
          attraction.activities = JSON.parse(attraction.activities)
        } catch {
          attraction.activities = attraction.activities.split(";").map((activity: string) => activity.trim())
        }
      } else {
        attraction.activities = []
      }

      if (attraction.included) {
        try {
          attraction.included = JSON.parse(attraction.included)
        } catch {
          attraction.included = attraction.included.split(";").map((item: string) => item.trim())
        }
      } else {
        attraction.included = []
      }

      if (attraction.notIncluded) {
        try {
          attraction.notIncluded = JSON.parse(attraction.notIncluded)
        } catch {
          attraction.notIncluded = attraction.notIncluded.split(";").map((item: string) => item.trim())
        }
      } else {
        attraction.notIncluded = []
      }

      attractions.push(attraction)
    }

    // Insert attractions into database
    let successCount = 0

    for (const attraction of attractions) {
      try {
        await query(
          `INSERT INTO attractions (
            id, name, location, image, rating, reviews, 
            priceUSD, priceKES, featured, category, description, 
            longDescription, bestTimeToVisit, duration, 
            lat, lng, gallery, activities, included, notIncluded
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            attraction.id,
            attraction.name,
            attraction.location,
            attraction.image,
            attraction.rating || 0,
            attraction.reviews || 0,
            attraction.priceUSD,
            attraction.priceKES,
            attraction.featured ? 1 : 0,
            attraction.category,
            attraction.description,
            attraction.longDescription || "",
            attraction.bestTimeToVisit || "",
            attraction.duration || "",
            attraction.lat || 0,
            attraction.lng || 0,
            JSON.stringify(attraction.gallery),
            JSON.stringify(attraction.activities),
            JSON.stringify(attraction.included),
            JSON.stringify(attraction.notIncluded),
          ],
        )

        successCount++
      } catch (error) {
        console.error(`Error inserting attraction ${attraction.name}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      count: successCount,
      total: attractions.length,
    })
  } catch (error) {
    console.error("Error importing attractions:", error)
    return NextResponse.json({ error: "Failed to import attractions" }, { status: 500 })
  }
}

