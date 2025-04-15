import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { query } from "@/lib/db"

// GET method to fetch users
export async function GET(request: Request) {
  const url = new URL(request.url)
  const id = url.searchParams.get("id")
  const email = url.searchParams.get("email")

  try {
    if (id) {
      // Fetch a specific user by ID
      const user = await query("SELECT * FROM users WHERE id = ?", [id])
      if (!user || (user as any[]).length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      return NextResponse.json((user as any[])[0])
    } else if (email) {
      // Fetch a user by email
      const user = await query("SELECT * FROM users WHERE email = ?", [email])
      return NextResponse.json(user)
    } else {
      // Fetch all users
      const users = await query("SELECT * FROM users")
      return NextResponse.json(users)
    }
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

// POST method to create a new user
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Generate a unique ID if not provided
    const userId = body.id || uuidv4()

    // Check if user with this email already exists
    const existingUser = await query("SELECT id FROM users WHERE email = ?", [body.email])
    if ((existingUser as any[]).length > 0) {
      return NextResponse.json(
        { error: "User with this email already exists", id: (existingUser as any[])[0].id },
        { status: 409 },
      )
    }

    // Insert new user
    await query(
      `INSERT INTO users (
        id, first_name, last_name, email, phone_number, 
        password_hash, role, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        body.first_name,
        body.last_name,
        body.email,
        body.phone_number || "",
        body.password_hash || "", // In a real app, you'd hash the password
        body.role || "customer",
        new Date(),
      ],
    )

    return NextResponse.json({ success: true, id: userId }, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

// PUT method to update a user
export async function PUT(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const body = await request.json()

    // Update user
    await query(
      `UPDATE users SET
        first_name = ?, last_name = ?, email = ?, phone_number = ?
      WHERE id = ?`,
      [body.first_name, body.last_name, body.email, body.phone_number, id],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

// Update the DELETE method in the users API route
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    // Delete user
    await query("DELETE FROM users WHERE id = ?", [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}

