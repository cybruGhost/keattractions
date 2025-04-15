"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Calendar, Users, MapPin, Search, Download, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Booking {
  id: string
  booking_type: string
  item_name: string
  travel_date: string
  adults: number
  children: number
  total_price_usd: number
  status: string
  payment_status: string
}

export default function MyBookingsPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("/api/profile")

        if (!response.ok) {
          if (response.status === 401) {
            // Unauthorized, redirect to login
            router.push("/login")
            return
          }
          throw new Error("Failed to fetch profile")
        }

        const data = await response.json()

        // Fetch user bookings
        const bookingsResponse = await fetch(`/api/bookings?userId=${data.user.id}`)

        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json()
          setBookings(bookingsData)
        } else {
          throw new Error("Failed to fetch bookings")
        }
      } catch (error) {
        console.error("Error fetching bookings:", error)
        toast({
          title: "Error",
          description: "Failed to load bookings. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [router, toast])

  const filteredBookings = bookings.filter((booking) => {
    // Apply search filter
    const matchesSearch = booking.item_name.toLowerCase().includes(searchQuery.toLowerCase())

    // Apply status filter
    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter || booking.payment_status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Group bookings by status
  const upcomingBookings = filteredBookings.filter(
    (booking) => new Date(booking.travel_date) >= new Date() && booking.status !== "cancelled",
  )

  const pastBookings = filteredBookings.filter(
    (booking) => new Date(booking.travel_date) < new Date() && booking.status !== "cancelled",
  )

  const cancelledBookings = filteredBookings.filter((booking) => booking.status === "cancelled")

  if (loading) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Bookings</h1>
            <p className="text-muted-foreground">View and manage your bookings</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/profile">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Link>
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>{bookings.length} bookings found</CardDescription>
              </div>
              <div className="w-full md:w-auto flex flex-col md:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search bookings..."
                    className="pl-8 w-full md:w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-8">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-12 border rounded-lg">
                <p className="text-muted-foreground mb-4">You don't have any upcoming bookings.</p>
                <Button asChild>
                  <Link href="/attractions">Explore Attractions</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {upcomingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastBookings.length === 0 ? (
              <div className="text-center py-12 border rounded-lg">
                <p className="text-muted-foreground">You don't have any past bookings.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pastBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cancelled">
            {cancelledBookings.length === 0 ? (
              <div className="text-center py-12 border rounded-lg">
                <p className="text-muted-foreground">You don't have any cancelled bookings.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {cancelledBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function BookingCard({ booking }: { booking: Booking }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg">{booking.item_name}</h3>
            <p className="text-sm text-muted-foreground capitalize">{booking.booking_type}</p>
          </div>
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                booking.status === "confirmed"
                  ? "bg-green-100 text-green-800"
                  : booking.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
              }`}
            >
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                booking.payment_status === "paid"
                  ? "bg-green-100 text-green-800"
                  : booking.payment_status === "unpaid"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{new Date(booking.travel_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>
              {booking.adults} adults, {booking.children} children
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>${booking.total_price_usd}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/booking/confirmation?id=${booking.id}`}>View Details</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/booking/confirmation?id=${booking.id}&download=true`}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

