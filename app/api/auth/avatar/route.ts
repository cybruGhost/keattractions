import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "@/lib/db"
import { verifyJwtToken } from "@/lib/auth"
import { writeFile } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
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

    // Parse the form data
    const formData = await request.formData()
    const file = formData.get("avatar") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed" },
        { status: 400 },
      )
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB" }, { status: 400 })
    }

    // Create a unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExt}`

    // Create the uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads")

    try {
      // Convert the file to a Buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Write the file to the uploads directory
      const filePath = path.join(uploadsDir, fileName)
      await writeFile(filePath, buffer)

      // Create the public URL
      const avatarUrl = `/uploads/${fileName}`

      // Update the user's avatar URL in the database
      await query("UPDATE users SET avatar_url = ? WHERE id = ?", [avatarUrl, payload.id])

      return NextResponse.json({ success: true, avatar_url: avatarUrl })
    } catch (error) {
      console.error("Error saving file:", error)
      return NextResponse.json({ error: "Failed to save file" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error uploading avatar:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

