import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"
import { getCurrentUser } from "@/lib/auth"

// Configure upload directory
const UPLOAD_DIR = join(process.cwd(), "public", "uploads")

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Ensure upload directory exists
    try {
      await mkdir(UPLOAD_DIR, { recursive: true })
    } catch (error) {
      console.error("Error creating upload directory:", error)
    }

    // Get form data with the file
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const fileType = file.type
    if (!fileType.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 })
    }

    // Get file extension
    const fileExtension = fileType.split("/")[1]

    // Generate unique filename
    const fileName = `${uuidv4()}.${fileExtension}`
    const filePath = join(UPLOAD_DIR, fileName)

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Write file to disk
    await writeFile(filePath, buffer)

    // Return the relative URL to the file
    const fileUrl = `/uploads/${fileName}`

    return NextResponse.json({
      success: true,
      url: fileUrl,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}

