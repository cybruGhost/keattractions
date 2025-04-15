"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  avatar_url: string | null
  username: string | null
  phone_number: string | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Function to fetch current user
  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/user")
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        return userData
      } else {
        setUser(null)
        return null
      }
    } catch (error) {
      console.error("Error fetching user:", error)
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Check authentication status on mount
  useEffect(() => {
    fetchUser()
  }, [])

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, message: data.error || "Login failed" }
      }

      // Fetch user data after successful login
      await fetchUser()
      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: "An error occurred during login" }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Function to refresh user data
  const refreshUser = async () => {
    await fetchUser()
  }

  return <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

