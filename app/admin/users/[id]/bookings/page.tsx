"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Calendar, DollarSign, Check, X, MessageSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BookingMessages } from "@/components/booking-messages"

interface Booking {
  id: string
  user_id: string
  booking_type: string
  item_name: string
  travel_date: string
  adults: number
  children: number
  total_price_usd: number
  status: string
  payment_status: string
  first_name: string
  last_name: string
  email: string
}

interface UserData {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
}

export default function UserBookingsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()

  const [bookings, setBookings] = useState<Booking[]>([])
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user details
        const userResponse = await fetch(`/api/users?id=${params.id}`)

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user")
        }

        const userData = await userResponse.json()
        setUser(userData)

        // Fetch user's bookings
        const bookingsResponse = await fetch(`/api/bookings?userId=${params.id}`)

        if (!bookingsResponse.ok) {
          throw new Error("Failed to fetch bookings")
        }

        const bookingsData = await bookingsResponse.json()
        setBookings(bookingsData)

        // Set the first booking as selected if any exist
        if (bookingsData.length > 0) {
          setSelectedBooking(bookingsData[0].id)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load user data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, toast])

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings?id=${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update booking status")
      }

      // Update booking in state
      setBookings(bookings.map((booking) => (booking.id === bookingId ? { ...booking, status: newStatus } : booking)))

      toast({
        title: "Status Updated",
        description: `Booking status has been updated to ${newStatus}.`,
      })
    } catch (error) {
      console.error("Error updating booking status:", error)
      toast({
        title: "Update Failed",
        description: "Failed to update booking status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handlePaymentStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings?id=${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payment_status: newStatus,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update payment status")
      }

      // Update booking in state
      setBookings(
        bookings.map((booking) => (booking.id === bookingId ? { ...booking, payment_status: newStatus } : booking)),
      )

      toast({
        title: "Payment Status Updated",
        description: `Payment status has been updated to ${newStatus}.`,
      })
    } catch (error) {
      console.error("Error updating payment status:", error)
      toast({
        title: "Update Failed",
        description: "Failed to update payment status. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
          <p className="text-muted-foreground mb-6">The user you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href="/admin/users">Back to Users</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <Button variant="ghost" asChild className="mr-4">
            <Link href="/admin/users">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {user.first_name} {user.last_name}'s Bookings
            </h1>
            <p className="text-muted-foreground">Manage bookings for {user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">
                    {user.first_name} {user.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                {user.phone_number && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{user.phone_number}</p>
                  </div>
                )}
                <div className="pt-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/admin/users/${user.id}`}>Edit User</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Bookings</CardTitle>
                <CardDescription>
                  {bookings.length} {bookings.length === 1 ? "booking" : "bookings"} found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No bookings found for this user.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedBooking === booking.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                        }`}
                        onClick={() => setSelectedBooking(booking.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{booking.item_name}</p>
                            <div className="flex items-center text-sm">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>{new Date(booking.travel_date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Badge
                            variant={
                              booking.status === "confirmed"
                                ? "default"
                                : booking.status === "pending"
                                  ? "outline"
                                  : "destructive"
                            }
                          >
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {selectedBooking ? (
              (() => {
                const booking = bookings.find((b) => b.id === selectedBooking)

                if (!booking) return null

                return (
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{booking.item_name}</CardTitle>
                          <CardDescription>Booking Reference: #{booking.id.slice(0, 8).toUpperCase()}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/booking/confirmation?id=${booking.id}`}>View Details</Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/bookings/${booking.id}`}>Edit Booking</Link>
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="details">
                        <TabsList>
                          <TabsTrigger value="details">Booking Details</TabsTrigger>
                          <TabsTrigger value="actions">Actions</TabsTrigger>
                          <TabsTrigger value="communication">Communication</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="space-y-6">
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Booking Date</p>
                              <p className="font-medium">{new Date(booking.travel_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Guests</p>
                              <p className="font-medium">
                                {booking.adults} adults, {booking.children} children
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Total Price</p>
                              <p className="font-medium">${booking.total_price_usd}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Booking Type</p>
                              <p className="font-medium capitalize">{booking.booking_type}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Status</p>
                              <Badge
                                variant={
                                  booking.status === "confirmed"
                                    ? "default"
                                    : booking.status === "pending"
                                      ? "outline"
                                      : "destructive"
                                }
                              >
                                {booking.status}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Payment Status</p>
                              <Badge
                                variant={
                                  booking.payment_status === "paid"
                                    ? "default"
                                    : booking.payment_status === "partially_paid"
                                      ? "outline"
                                      : "secondary"
                                }
                              >
                                {booking.payment_status}
                              </Badge>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="actions" className="space-y-6">
                          <div className="space-y-4 mt-4">
                            <div>
                              <p className="font-medium mb-2">Update Booking Status</p>
                              <div className="flex gap-2">
                                <Button
                                  variant={booking.status === "pending" ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleStatusChange(booking.id, "pending")}
                                >
                                  Pending
                                </Button>
                                <Button
                                  variant={booking.status === "confirmed" ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleStatusChange(booking.id, "confirmed")}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Confirm
                                </Button>
                                <Button
                                  variant={booking.status === "cancelled" ? "destructive" : "outline"}
                                  size="sm"
                                  onClick={() => handleStatusChange(booking.id, "cancelled")}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            </div>

                            <div>
                              <p className="font-medium mb-2">Update Payment Status</p>
                              <div className="flex gap-2">
                                <Button
                                  variant={booking.payment_status === "unpaid" ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handlePaymentStatusChange(booking.id, "unpaid")}
                                >
                                  Unpaid
                                </Button>
                                <Button
                                  variant={booking.payment_status === "partially_paid" ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handlePaymentStatusChange(booking.id, "partially_paid")}
                                >
                                  Partially Paid
                                </Button>
                                <Button
                                  variant={booking.payment_status === "paid" ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handlePaymentStatusChange(booking.id, "paid")}
                                >
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  Paid
                                </Button>
                              </div>
                            </div>

                            <div className="pt-4">
                              <Button asChild className="w-full">
                                <Link href={`/admin/bookings/${booking.id}`}>Edit Full Booking Details</Link>
                              </Button>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="communication">
                          <div className="mt-4">
                            <BookingMessages bookingId={booking.id} userId={user.id} isAdmin={true} />
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                )
              })()
            ) : (
              <div className="flex items-center justify-center h-full min-h-[300px] border rounded-lg">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Booking Selected</h3>
                  <p className="text-muted-foreground">Select a booking from the list to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

