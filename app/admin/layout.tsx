"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  MapPin,
  Users,
  Calendar,
  Settings,
  MessageSquare,
  LogOut,
  Menu,
  ChevronRight,
  ShoppingBag,
  Database,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AdminUser {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const fetchAdminUser = async () => {
      try {
        const response = await fetch("/api/admin/user")

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/admin/login")
            return
          }
          throw new Error("Failed to fetch admin user")
        }

        const data = await response.json()
        setUser(data.user)
      } catch (error) {
        console.error("Error fetching admin user:", error)
        router.push("/admin/login")
      } finally {
        setLoading(false)
      }
    }

    fetchAdminUser()
  }, [router])

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/admin/logout", {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of the admin panel.",
        })

        router.push("/admin/login")
      }
    } catch (error) {
      console.error("Admin logout error:", error)
    }
  }

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Attractions", href: "/admin/attractions", icon: MapPin },
    { name: "Safaris", href: "/admin/safaris", icon: ShoppingBag },
    { name: "Bookings", href: "/admin/bookings", icon: Calendar },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Messages", href: "/admin/messages", icon: MessageSquare },
    { name: "Database", href: "/admin/database", icon: Database },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Special case for login page - don't show admin layout
  if (pathname === "/admin/login") {
    return children
  }

  if (!user && pathname !== "/admin/login") {
    return null // Will redirect to login in the useEffect
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 hidden md:flex flex-col border-r bg-background transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <Link href="/admin" className={`font-bold text-xl ${!sidebarOpen && "hidden"}`}>
            Admin Panel
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="ml-auto">
            <ChevronRight className={`h-5 w-5 transition-transform ${!sidebarOpen && "rotate-180"}`} />
          </Button>
        </div>

        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className={`flex items-center gap-3 ${!sidebarOpen && "justify-center"}`}>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
              {user?.first_name?.charAt(0)}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-40 h-16 border-b bg-background md:hidden">
        <div className="flex h-full items-center px-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0">
              <div className="flex h-16 items-center px-6 border-b">
                <Link href="/admin" className="font-bold text-xl">
                  Admin Panel
                </Link>
              </div>
              <ScrollArea className="h-[calc(100vh-4rem)]">
                <div className="p-4">
                  <nav className="space-y-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                          pathname === item.href || pathname.startsWith(`${item.href}/`)
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </nav>

                  <Separator className="my-4" />

                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      {user?.first_name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>

                  <Button variant="destructive" className="w-full mt-4" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>

          <div className="ml-4 font-bold">Admin Panel</div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "md:ml-64" : "md:ml-20"
        } ${pathname === "/admin" ? "pt-16 md:pt-0" : "pt-16"}`}
      >
        {children}
      </main>
    </div>
  )
}

