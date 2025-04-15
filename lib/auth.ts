import { cookies } from "next/headers"
import { query, queryRow } from "@/lib/db"
import { jwtVerify, SignJWT } from "jose"
import { v4 as uuidv4 } from "uuid"

// Secret key for JWT signing
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-at-least-32-characters-long")

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
}

// Sign a new JWT token
export async function signToken(payload: any) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET)

  return token
}

// Verify a JWT token
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    return null
  }
}

// Get the current user from the session
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies() // Fix: await cookies()
  const token = cookieStore.get("auth_token")

  if (!token) {
    return null
  }

  try {
    const payload = await verifyToken(token.value)

    if (!payload || !payload.id) {
      return null
    }

    // Get user from database
    const user = await queryRow("SELECT * FROM users WHERE id = ?", [payload.id])

    if (!user) {
      return null
    }

    return user as User
  } catch (error) {
    console.error("Auth error:", error)
    return null
  }
}

// Login user
export async function login(email: string, password: string) {
  try {
    // In a real app, you'd hash the password and compare with the stored hash
    // For demo purposes, we'll just check if the email exists
    const user = await queryRow("SELECT * FROM users WHERE email = ?", [email])

    if (!user) {
      return { success: false, error: "Invalid credentials" }
    }

    // Sign JWT token
    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    // Set cookie
    const cookieStore = await cookies() // Fix: await cookies()
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    })

    return { success: true, user }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "An error occurred during login" }
  }
}

// Register user
export async function register(userData: {
  first_name: string
  last_name: string
  email: string
  password: string
  phone_number?: string
}) {
  try {
    // Check if user already exists
    const existingUser = await queryRow("SELECT * FROM users WHERE email = ?", [userData.email])

    if (existingUser) {
      return { success: false, error: "Email already in use" }
    }

    // In a real app, you'd hash the password
    // For demo purposes, we'll just store it as is
    const userId = uuidv4()

    await query(
      `INSERT INTO users (
        id, first_name, last_name, email, password_hash, phone_number, role, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        userData.first_name,
        userData.last_name,
        userData.email,
        userData.password, // In a real app, this would be hashed
        userData.phone_number || "",
        "customer",
        new Date(),
      ],
    )

    // Sign JWT token
    const token = await signToken({
      id: userId,
      email: userData.email,
      role: "customer",
    })

    // Set cookie
    const cookieStore = await cookies() // Fix: await cookies()
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    })

    return { success: true, user: { id: userId, ...userData, role: "customer" } }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, error: "An error occurred during registration" }
  }
}

// Logout user
export async function logout() {
  const cookieStore = await cookies() // Fix: await cookies()
  cookieStore.delete("auth_token")
}

