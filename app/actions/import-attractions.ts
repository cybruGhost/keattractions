"use server"

import { parse } from "csv-parse/sync"
import { revalidatePath } from "next/cache"
import { query } from "@/lib/db"

export async function importAttractionsFromCSV(formData: FormData) {
  try {
    const file = formData.get("file") as File

    if (!file) {
      return { success: false, error: "No file provided" }
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Parse CSV
    const records = parse(buffer.toString(), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    // Process and validate data
    const attractions = records.map((record: any) => {
      // Convert string coordinates to object if needed
      let coordinates = record.coordinates
      if (typeof record.coordinates === "string") {
        try {
          coordinates = JSON.parse(record.coordinates)
        } catch (e) {
          // If parsing fails, try to extract lat/lng from string format
          const match = record.coordinates.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/)
          if (match) {
            coordinates = { lat: Number.parseFloat(match[1]), lng: Number.parseFloat(match[2]) }
          } else {
            coordinates = { lat: 0, lng: 0 }
          }
        }
      }

      // Convert string arrays to actual arrays if needed
      let gallery = record.gallery
      if (typeof record.gallery === "string") {
        try {
          gallery = JSON.parse(record.gallery)
        } catch (e) {
          gallery = record.gallery.split(",").map((url: string) => url.trim())
        }
      }

      let activities = record.activities
      if (typeof record.activities === "string") {
        try {
          activities = JSON.parse(record.activities)
        } catch (e) {
          activities = record.activities.split(",").map((activity: string) => activity.trim())
        }
      }

      let included = record.included
      if (typeof record.included === "string") {
        try {
          included = JSON.parse(record.included)
        } catch (e) {
          included = record.included.split(",").map((item: string) => item.trim())
        }
      }

      let notIncluded = record.notIncluded
      if (typeof record.notIncluded === "string") {
        try {
          notIncluded = JSON.parse(record.notIncluded)
        } catch (e) {
          notIncluded = record.notIncluded.split(",").map((item: string) => item.trim())
        }
      }

      // Convert numeric strings to numbers
      const priceUSD = Number.parseFloat(record.priceUSD) || 0
      const priceKES = Number.parseFloat(record.priceKES) || 0
      const rating = Number.parseFloat(record.rating) || 0
      const reviews = Number.parseInt(record.reviews) || 0

      // Convert string boolean to actual boolean
      let featured = record.featured
      if (typeof record.featured === "string") {
        featured = record.featured.toLowerCase() === "true"
      }

      return {
        id: record.id || generateSlug(record.name),
        name: record.name,
        location: record.location,
        coordinates,
        image: record.image,
        gallery,
        rating,
        reviews,
        priceUSD,
        priceKES,
        featured,
        description: record.description,
        longDescription: record.longDescription,
        activities,
        bestTimeToVisit: record.bestTimeToVisit,
        duration: record.duration,
        included,
        notIncluded,
        category: record.category,
      }
    })

    // Insert attractions into database
    for (const attraction of attractions) {
      // Check if attraction already exists
      const existingAttraction = await query("SELECT id FROM attractions WHERE id = ?", [attraction.id])

      if (existingAttraction && (existingAttraction as any[]).length > 0) {
        // Update existing attraction
        await query(
          `UPDATE attractions SET
            name = ?, location = ?, image = ?, rating = ?, reviews = ?, 
            priceUSD = ?, priceKES = ?, featured = ?, category = ?, description = ?, 
            longDescription = ?, bestTimeToVisit = ?, duration = ?, 
            lat = ?, lng = ?, gallery = ?, activities = ?, included = ?, notIncluded = ?
          WHERE id = ?`,
          [
            attraction.name,
            attraction.location,
            attraction.image,
            attraction.rating,
            attraction.reviews,
            attraction.priceUSD,
            attraction.priceKES,
            attraction.featured ? 1 : 0,
            attraction.category,
            attraction.description,
            attraction.longDescription,
            attraction.bestTimeToVisit,
            attraction.duration,
            attraction.coordinates.lat,
            attraction.coordinates.lng,
            JSON.stringify(attraction.gallery),
            JSON.stringify(attraction.activities),
            JSON.stringify(attraction.included),
            JSON.stringify(attraction.notIncluded),
            attraction.id,
          ],
        )
      } else {
        // Insert new attraction
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
            attraction.rating,
            attraction.reviews,
            attraction.priceUSD,
            attraction.priceKES,
            attraction.featured ? 1 : 0,
            attraction.category,
            attraction.description,
            attraction.longDescription,
            attraction.bestTimeToVisit,
            attraction.duration,
            attraction.coordinates.lat,
            attraction.coordinates.lng,
            JSON.stringify(attraction.gallery),
            JSON.stringify(attraction.activities),
            JSON.stringify(attraction.included),
            JSON.stringify(attraction.notIncluded),
          ],
        )
      }
    }

    // Revalidate paths that use this data
    revalidatePath("/attractions")
    revalidatePath("/attractions/[id]")
    revalidatePath("/")

    return { success: true, count: attractions.length }
  } catch (error: any) {
    console.error("Import error:", error)
    return { success: false, error: error.message }
  }
}

// Helper function to generate a slug from a name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

