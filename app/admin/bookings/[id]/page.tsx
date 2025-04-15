"use client"

import type React from "react"
import { use } from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Save, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookingMessages } from "@/components/booking-messages"

interface BookingDetails {
  id: string
  user_id: string
  booking_type: string
  item_id: string
  item_name: string
  booking_date: string
  travel_date: string
  adults: number
  children: number
  accommodation_type: string
  special_requests: string
  total_price_usd: number
  total_price_kes: number
  deposit_amount: number
  deposit_paid: boolean
  status: string
  payment_status: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
}

export default function EditBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const resolvedParams = use(params)

  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await fetch(`/api/bookings?id=${resolvedParams.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch booking details")
        }

        const data = await response.json()
        setBooking(data)
      } catch (error) {
        console.error("Error fetching booking:", error)
        toast({
          title: "Error",
          description: "Failed to load booking details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBookingDetails()
  }, [resolvedParams.id, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!booking) return

    const { name, value } = e.target
    setBooking({ ...booking, [name]: value })
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!booking) return

    const { name, value } = e.target
    setBooking({ ...booking, [name]: Number.parseFloat(value) || 0 })
  }

  const handleSelectChange = (name: string, value: string) => {
    if (!booking) return

    setBooking({ ...booking, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!booking) return

    setSaving(true)

    try {
      const response = await fetch(`/api/bookings?id=${resolvedParams.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          travelDate: booking.travel_date,
          adults: booking.adults,
          children: booking.children,
          accommodationType: booking.accommodation_type,
          specialRequests: booking.special_requests,
          totalPriceUSD: booking.total_price_usd,
          totalPriceKES: booking.total_price_kes,
          depositAmount: booking.deposit_amount,
          depositPaid: booking.deposit_paid,
          status: booking.status,
          paymentStatus: booking.payment_status,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update booking")
      }

      toast({
        title: "Booking Updated",
        description: "The booking has been successfully updated.",
      })

      // Redirect to bookings list
      router.push("/admin/bookings")
    } catch (error) {
      console.error("Error updating booking:", error)
      toast({
        title: "Update Failed",
        description: "Failed to update booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/bookings?id=${resolvedParams.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete booking")
      }

      toast({
        title: "Booking Deleted",
        description: "The booking has been successfully deleted.",
      })

      // Redirect to bookings list
      router.push("/admin/bookings")
    } catch (error) {
      console.error("Error deleting booking:", error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setShowDeleteDialog(false)
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

  if (!booking) {
    return (
      <div className="container py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-muted-foreground mb-6">Booking not found</p>
          <Button asChild>
            <Link href="/admin/bookings">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Bookings
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-8">
          <Button variant="ghost" asChild className="mr-4">
            <Link href="/admin/bookings">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Bookings
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Booking</h1>
            <p className="text-muted-foreground">
              Update booking details for {booking.first_name} {booking.last_name}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Information</CardTitle>
                  <CardDescription>Update the booking details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="travel_date">Travel Date</Label>
                      <Input
                        id="travel_date"
                        name="travel_date"
                        type="date"
                        value={booking.travel_date.split("T")[0]}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accommodation_type">Accommodation Type</Label>
                      <Select
                        value={booking.accommodation_type}
                        onValueChange={(value) => handleSelectChange("accommodation_type", value)}
                      >
                        <SelectTrigger id="accommodation_type">
                          <SelectValue placeholder="Select accommodation type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="deluxe">Deluxe</SelectItem>
                          <SelectItem value="luxury">Luxury</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="adults">Adults</Label>
                      <Input
                        id="adults"
                        name="adults"
                        type="number"
                        min="1"
                        value={booking.adults}
                        onChange={handleNumberChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="children">Children</Label>
                      <Input
                        id="children"
                        name="children"
                        type="number"
                        min="0"
                        value={booking.children}
                        onChange={handleNumberChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="special_requests">Special Requests</Label>
                    <Textarea
                      id="special_requests"
                      name="special_requests"
                      value={booking.special_requests || ""}
                      onChange={handleInputChange}
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                  <CardDescription>Update the pricing information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="total_price_usd">Total Price (USD)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5">$</span>
                        <Input
                          id="total_price_usd"
                          name="total_price_usd"
                          type="number"
                          min="0"
                          step="0.01"
                          className="pl-7"
                          value={booking.total_price_usd}
                          onChange={handleNumberChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="total_price_kes">Total Price (KES)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5">KES</span>
                        <Input
                          id="total_price_kes"
                          name="total_price_kes"
                          type="number"
                          min="0"
                          step="1"
                          className="pl-12"
                          value={booking.total_price_kes}
                          onChange={handleNumberChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deposit_amount">Deposit Amount (USD)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5">$</span>
                        <Input
                          id="deposit_amount"
                          name="deposit_amount"
                          type="number"
                          min="0"
                          step="0.01"
                          className="pl-7"
                          value={booking.deposit_amount}
                          onChange={handleNumberChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deposit_paid">Deposit Status</Label>
                      <Select
                        value={booking.deposit_paid ? "true" : "false"}
                        onValueChange={(value) => handleSelectChange("deposit_paid", value === "true")}
                      >
                        <SelectTrigger id="deposit_paid">
                          <SelectValue placeholder="Select deposit status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Paid</SelectItem>
                          <SelectItem value="false">Not Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                  <CardDescription>Customer details (read-only)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <p className="border p-2 rounded-md">
                      {booking.first_name} {booking.last_name}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <p className="border p-2 rounded-md">{booking.email}</p>
                  </div>

                  {booking.phone_number && (
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <p className="border p-2 rounded-md">{booking.phone_number}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Booking Reference</Label>
                    <p className="border p-2 rounded-md font-mono">{booking.id.slice(0, 8).toUpperCase()}</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Booking Date</Label>
                    <p className="border p-2 rounded-md">{new Date(booking.booking_date).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                  <CardDescription>Update booking and payment status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Booking Status</Label>
                    <Select value={booking.status} onValueChange={(value) => handleSelectChange("status", value)}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select booking status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment_status">Payment Status</Label>
                    <Select
                      value={booking.payment_status}
                      onValueChange={(value) => handleSelectChange("payment_status", value)}
                    >
                      <SelectTrigger id="payment_status">
                        <SelectValue placeholder="Select payment status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unpaid">Unpaid</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                        <SelectItem value="partially_paid">Partially Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button type="submit" className="w-full" disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full text-red-500 hover:text-red-600"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Booking
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the booking and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Tabs defaultValue="details" className="mt-6">
          <TabsList>
            <TabsTrigger value="details">Booking Details</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
          </TabsList>

          <TabsContent value="details">{/* Existing booking details content */}</TabsContent>

          <TabsContent value="communication">
            <Card>
              <CardHeader>
                <CardTitle>Customer Communication</CardTitle>
                <CardDescription>Send messages to the customer regarding this booking</CardDescription>
              </CardHeader>
              <CardContent>
                <BookingMessages bookingId={booking.id} userId={booking.user_id} isAdmin={true} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

