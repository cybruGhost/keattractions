"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Calendar, Users, MapPin, Check, Download, ArrowLeft, Printer } from "lucide-react"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

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

export default function BookingConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const bookingId = searchParams.get("id")

  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        setError("No booking ID provided")
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/bookings?id=${bookingId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch booking details")
        }

        const data = await response.json()
        setBooking(data)
      } catch (err) {
        console.error(err)
        setError("Error loading booking details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchBookingDetails()
  }, [bookingId])

  const handleDownloadPDF = async () => {
    if (!booking) return

    const element = document.getElementById("booking-confirmation")
    if (!element) return

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
      pdf.save(`booking-confirmation-${booking.id}.pdf`)

      toast({
        title: "PDF Downloaded",
        description: "Your booking confirmation has been downloaded.",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Download Failed",
        description: "Failed to download PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handlePrint = () => {
    window.print()
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

  if (error || !booking) {
    return (
      <div className="container py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-muted-foreground mb-6">{error || "Booking not found"}</p>
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Booking Confirmation</h1>
            <p className="text-muted-foreground">
              Your booking has been confirmed. Reference: #{booking.id.slice(0, 8)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        <div id="booking-confirmation" className="space-y-8 bg-white p-8 rounded-lg border">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Booking Confirmation</h2>
              <p className="text-muted-foreground">Thank you for your booking!</p>
            </div>
            <div className="text-right">
              <p className="font-bold">Savanak Kenya Tours</p>
              <p className="text-sm text-muted-foreground">info@savanak.co.ke</p>
              <p className="text-sm text-muted-foreground">+254 700 000 000</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Booking Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Booking Reference:</span>
                  <span className="font-medium">{booking.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Booking Date:</span>
                  <span className="font-medium">{new Date(booking.booking_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Travel Date:</span>
                  <span className="font-medium">{new Date(booking.travel_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium capitalize">{booking.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status:</span>
                  <span className="font-medium capitalize">{booking.payment_status}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Customer Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">
                    {booking.first_name} {booking.last_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{booking.email}</span>
                </div>
                {booking.phone_number && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">{booking.phone_number}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-bold mb-4">Booking Summary</h3>
            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 p-4 bg-muted/50">
                <div className="font-medium">Item</div>
                <div className="font-medium">Details</div>
                <div className="font-medium text-right">Price</div>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 border-t">
                <div>
                  <p className="font-medium">{booking.item_name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{booking.booking_type}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(booking.travel_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {booking.adults} adults, {booking.children} children
                    </span>
                  </div>
                  {booking.accommodation_type && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Accommodation:{" "}
                        {booking.accommodation_type.charAt(0).toUpperCase() + booking.accommodation_type.slice(1)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium">${booking.total_price_usd}</p>
                  <p className="text-sm text-muted-foreground">KES {booking.total_price_kes.toLocaleString()}</p>
                </div>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 border-t bg-muted/30">
                <div className="md:col-span-2 font-medium">Total</div>
                <div className="text-right font-bold">
                  <p>${booking.total_price_usd}</p>
                  <p className="text-sm text-muted-foreground">KES {booking.total_price_kes.toLocaleString()}</p>
                </div>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 border-t">
                <div className="md:col-span-2">
                  <p className="font-medium">Deposit (30%)</p>
                  <p className="text-sm text-muted-foreground">{booking.deposit_paid ? "Paid" : "Due"}</p>
                </div>
                <div className="text-right font-medium">
                  <p>${booking.deposit_amount}</p>
                  <p className="text-sm text-muted-foreground">
                    KES {Math.round(booking.total_price_kes * 0.3).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 border-t">
                <div className="md:col-span-2">
                  <p className="font-medium">Remaining Balance</p>
                  <p className="text-sm text-muted-foreground">Due 7 days before travel date</p>
                </div>
                <div className="text-right font-medium">
                  <p>${booking.total_price_usd - booking.deposit_amount}</p>
                  <p className="text-sm text-muted-foreground">
                    KES {Math.round(booking.total_price_kes * 0.7).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {booking.special_requests && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-bold mb-4">Special Requests</h3>
                <p className="p-4 border rounded-lg bg-muted/30">{booking.special_requests}</p>
              </div>
            </>
          )}

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-bold">Important Information</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p>Please arrive at least 30 minutes before the scheduled time.</p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p>Bring a valid ID or passport for verification.</p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p>The remaining balance must be paid 7 days before the travel date.</p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p>Free cancellation up to 30 days before travel. Cancellations within 30 days may incur fees.</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              If you have any questions, please contact us at info@savanak.co.ke or +254 700 000 000.
            </p>
            <p className="text-sm text-muted-foreground mt-2">Thank you for choosing Savanak Kenya Tours!</p>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Home
            </Link>
          </Button>
          <Button asChild>
            <Link href="/my-bookings">View All Bookings</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

