"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Menu, User, LogIn, LogOut, ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

interface UserType {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
}

export function SiteHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [isScrolled, setIsScrolled] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/user")
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [pathname]) // Re-fetch user data when pathname changes

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        // Clear user state
        setUser(null)

        // Show success message
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of your account.",
        })

        // Redirect to home page
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Attractions", href: "/attractions" },
    { name: "Safaris", href: "/safaris" },
    { name: "Prices", href: "/prices" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled ? "bg-background/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="font-bold text-xl">
            Savanak Kenya
          </Link>
          <nav className="hidden md:flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href ? "text-primary" : "text-foreground/70"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="hidden md:inline-block">{user.first_name}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href="/profile">My Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/my-bookings">My Bookings</Link>
                      </DropdownMenuItem>
                      {user.role === "admin" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href="/admin">Admin Dashboard</Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <div className="flex items-center gap-2">
                          <LogOut className="h-4 w-4" />
                          Logout
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button asChild variant="ghost" size="sm" className="gap-2">
                    <Link href="/login">
                      <LogIn className="h-4 w-4" />
                      <span className="hidden md:inline-block">Login</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="gap-2 hidden md:flex">
                    <Link href="/register">
                      <User className="h-4 w-4" />
                      <span>Register</span>
                    </Link>
                  </Button>
                </div>
              )}
            </>
          )}
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link href="/cart">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden md:inline-block">Cart</span>
            </Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 mt-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-lg font-medium transition-colors hover:text-primary ${
                      pathname === item.href ? "text-primary" : "text-foreground/70"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                {user ? (
                  <>
                    <Separator className="my-2" />
                    <Link href="/profile" className="text-lg font-medium">
                      My Profile
                    </Link>
                    <Link href="/my-bookings" className="text-lg font-medium">
                      My Bookings
                    </Link>
                    {user.role === "admin" && (
                      <Link href="/admin" className="text-lg font-medium">
                        Admin Dashboard
                      </Link>
                    )}
                    <button onClick={handleLogout} className="text-lg font-medium text-red-500 text-left">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Separator className="my-2" />
                    <Link href="/login" className="text-lg font-medium">
                      Login
                    </Link>
                    <Link href="/register" className="text-lg font-medium">
                      Register
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

