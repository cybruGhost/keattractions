import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

// Secret key for JWT verification
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-at-least-32-characters-long")

// Verify a JWT token
async function verifyAuth(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    return null
  }
}

export async function middleware(req: NextRequest) {
  // Get auth tokens from cookies
  const authToken = req.cookies.get("auth_token")?.value
  const adminToken = req.cookies.get("admin_token")?.value

  // Protected routes that require authentication
  const protectedRoutes = ["/profile", "/booking/confirmation", "/my-bookings"]
  const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  // Admin routes that require admin privileges
  const adminRoutes = ["/admin"]
  const isAdminRoute = adminRoutes.some((route) => req.nextUrl.pathname.startsWith(route))
  const isAdminLoginRoute = req.nextUrl.pathname === "/admin/login"

  // If accessing a protected route without auth token, redirect to login
  if (isProtectedRoute && !authToken) {
    return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(req.nextUrl.pathname)}`, req.url))
  }

  // If accessing an admin route
  if (isAdminRoute) {
    // Skip middleware for admin login page
    if (isAdminLoginRoute) {
      return NextResponse.next()
    }

    // Check if admin token exists
    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }

    try {
      // Verify if user has admin role
      const payload = await verifyAuth(adminToken)

      if (!payload || payload.role !== "admin") {
        return NextResponse.redirect(new URL("/admin/login", req.url))
      }
    } catch (error) {
      console.error("Admin verification error:", error)
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/profile/:path*", "/admin/:path*", "/booking/confirmation/:path*", "/my-bookings/:path*"],
}

