import { cookies } from "next/headers"
import { queryRow } from "@/lib/db"
import { jwtVerify, SignJWT } from "jose"

// Secret key for JWT signing
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-at-least-32-characters-long")

export interface AdminUser {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
}

// Sign a new JWT token for admin
export async function signAdminToken(payload: any) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET)

  return token
}

// Verify a JWT token
export async function verifyAdminToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    return null
  }
}

// Get the current admin user from the session
export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_token")

  if (!token) {
    return null
  }

  try {
    const payload = await verifyAdminToken(token.value)

    if (!payload || !payload.id || payload.role !== "admin") {
      return null
    }

    // Get user from database
    const user = await queryRow("SELECT * FROM users WHERE id = ? AND role = 'admin'", [payload.id])

    if (!user) {
      return null
    }

    return user as AdminUser
  } catch (error) {
    console.error("Admin auth error:", error)
    return null
  }
}

// Login admin user
export async function adminLogin(email: string, password: string) {
  try {
    // In a real app, you'd hash the password and compare with the stored hash
    // For demo purposes, we'll just check if the email exists and the user is an admin
    const user = await queryRow("SELECT * FROM users WHERE email = ? AND role = 'admin'", [email])

    if (!user) {
      return { success: false, error: "Invalid credentials or not an admin" }
    }

    // Sign JWT token
    const token = await signAdminToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("admin_token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    })

    return { success: true, user }
  } catch (error) {
    console.error("Admin login error:", error)
    return { success: false, error: "An error occurred during login" }
  }
}

// Logout admin user
export async function adminLogout() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_token")
}

