"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { v4 as uuidv4 } from "uuid"
import { Calendar, Users, CreditCard, MapPin, Check, Info, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface BookingItem {
  id: string
  name: string
  image: string
  price: number
  priceKES: number
}

export default function BookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Get query parameters
  const bookingType = searchParams.get("type") || "attraction"
  const itemId = searchParams.get("id") || ""
  const adults = Number(searchParams.get("adults") || 2)
  const children = Number(searchParams.get("children") || 0)
  const travelDate = searchParams.get("date") || ""
  const accommodation = searchParams.get("accommodation") || "standard"
  const totalUSD = Number(searchParams.get("totalUSD") || 0)
  const totalKES = Number(searchParams.get("totalKES") || 0)

  // State for booking item details
  const [item, setItem] = useState<BookingItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for form
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [specialRequests, setSpecialRequests] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Calculate deposit amount (30% of total)
  const depositAmount = Math.round(totalUSD * 0.3)
  const depositAmountKES = Math.round(totalKES * 0.3)

  useEffect(() => {
    const fetchItemDetails = async () => {
      if (!itemId) {
        setError("No item selected for booking")
        setLoading(false)
        return
      }

      try {
        // Fetch item details based on booking type
        const endpoint = bookingType === "safari" ? "/api/safaris" : "/api/attractions"
        const response = await fetch(`${endpoint}?id=${itemId}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch ${bookingType} details`)
        }

        const data = await response.json()

        setItem({
          id: data.id,
          name: data.name,
          image: data.image,
          price: data.priceUSD,
          priceKES: data.priceKES,
        })

        // For demo purposes, create a random user ID
        // In a real app, this would come from authentication
        setUserId(uuidv4())
      } catch (err) {
        console.error(err)
        setError(`Error loading ${bookingType} details. Please try again.`)
      } finally {
        setLoading(false)
      }
    }

    fetchItemDetails()
  }, [bookingType, itemId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId || !item) {
      toast({
        title: "Error",
        description: "Missing required information. Please try again.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // First, create or get a user
      let userIdToUse = userId

      // Check if user exists with this email
      const checkUserResponse = await fetch(`/api/users?email=${encodeURIComponent(email)}`)

      if (checkUserResponse.ok) {
        const users = await checkUserResponse.json()

        if (users.length > 0) {
          // User exists, use their ID
          userIdToUse = users[0].id
          console.log("Using existing user:", userIdToUse)
        } else {
          // User doesn't exist, create a new one
          console.log("Creating new user with ID:", userId)
          const createUserResponse = await fetch("/api/users", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: userId,
              first_name: firstName,
              last_name: lastName,
              email: email,
              phone_number: phone,
              password_hash: "", // In a real app, you'd handle this properly
              role: "customer",
            }),
          })

          if (!createUserResponse.ok) {
            const errorData = await createUserResponse.json()
            console.error("Failed to create user:", errorData)
            throw new Error("Failed to create user: " + (errorData.error || "Unknown error"))
          }

          const userData = await createUserResponse.json()
          console.log("User created:", userData)
        }
      } else {
        throw new Error("Failed to check if user exists")
      }

      // Now create booking with the valid user ID
      console.log("Creating booking with user ID:", userIdToUse)
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userIdToUse,
          bookingType,
          itemId: item.id,
          travelDate,
          adults,
          children,
          accommodationType: accommodation,
          specialRequests,
          totalPriceUSD: totalUSD,
          totalPriceKES: totalKES,
          depositAmount,
          depositPaid: true, // Assuming payment is successful
          status: "confirmed",
          paymentStatus: "unpaid", // Using a valid ENUM value
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error("Failed to create booking: " + (errorData.error || "Unknown error"))
      }

      const data = await response.json()

      toast({
        title: "Booking Confirmed!",
        description: "Your booking has been successfully confirmed. Check your email for details.",
      })

      // Redirect to confirmation page
      router.push(`/booking/confirmation?id=${data.id}`)
    } catch (error) {
      console.error("Booking error:", error)
      toast({
        title: "Booking Failed",
        description:
          error instanceof Error ? error.message : "There was an error processing your booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="container py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-muted-foreground mb-6">{error || "Item not found"}</p>
          <Link href={bookingType === "safari" ? "/safaris" : "/attractions"}>
            <Button>Back to {bookingType === "safari" ? "Safaris" : "Attractions"}</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Complete Your Booking</h1>
            <p className="text-muted-foreground">
              You're just a few steps away from confirming your {bookingType === "safari" ? "safari" : "attraction"}{" "}
              booking.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Information</CardTitle>
                  <CardDescription>Please fill in your details to complete the booking</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first-name">First Name</Label>
                          <Input
                            id="first-name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last-name">Last Name</Label>
                          <Input
                            id="last-name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-medium mb-4">Special Requests</h3>
                      <div className="space-y-2">
                        <Label htmlFor="special-requests">Any special requirements or requests?</Label>
                        <Textarea
                          id="special-requests"
                          placeholder="E.g., dietary restrictions, accessibility needs, etc."
                          value={specialRequests}
                          onChange={(e) => setSpecialRequests(e.target.value)}
                          rows={4}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-medium mb-4">Payment Method</h3>
                      <Alert className="mb-4">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Deposit Payment</AlertTitle>
                        <AlertDescription>
                          A 30% deposit (${depositAmount}) is required to confirm your booking. The remaining balance
                          can be paid later.
                        </AlertDescription>
                      </Alert>

                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                        <div className="flex items-center space-x-2 border p-4 rounded-md">
                          <RadioGroupItem value="credit-card" id="credit-card" />
                          <Label htmlFor="credit-card" className="flex items-center gap-2 cursor-pointer">
                            <CreditCard className="h-5 w-5" />
                            Credit/Debit Card
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 border p-4 rounded-md">
                          <RadioGroupItem value="mpesa" id="mpesa" />
                          <Label htmlFor="mpesa" className="flex items-center gap-2 cursor-pointer">
                            <Image src="/placeholder.svg?height=20&width=20" alt="M-Pesa" width={20} height={20} />
                            M-Pesa
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 border p-4 rounded-md">
                          <RadioGroupItem value="paypal" id="paypal" />
                          <Label htmlFor="paypal" className="flex items-center gap-2 cursor-pointer">
                            <Image src="/placeholder.svg?height=20&width=20" alt="PayPal" width={20} height={20} />
                            PayPal
                          </Label>
                        </div>
                      </RadioGroup>

                      <div className="mt-6">
                        <Tabs defaultValue="card" className="w-full">
                          <TabsList className="grid grid-cols-3 mb-4">
                            <TabsTrigger value="card">Card</TabsTrigger>
                            <TabsTrigger value="mpesa">M-Pesa</TabsTrigger>
                            <TabsTrigger value="paypal">PayPal</TabsTrigger>
                          </TabsList>
                          <TabsContent value="card">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="card-number">Card Number</Label>
                                <Input id="card-number" placeholder="1234 5678 9012 3456" />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="expiry">Expiry Date</Label>
                                  <Input id="expiry" placeholder="MM/YY" />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="cvc">CVC</Label>
                                  <Input id="cvc" placeholder="123" />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="name-on-card">Name on Card</Label>
                                <Input id="name-on-card" placeholder="John Doe" />
                              </div>
                            </div>
                          </TabsContent>
                          <TabsContent value="mpesa">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="mpesa-number">M-Pesa Phone Number</Label>
                                <Input id="mpesa-number" placeholder="+254 7XX XXX XXX" />
                              </div>
                              <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>M-Pesa Payment</AlertTitle>
                                <AlertDescription>
                                  You will receive an STK push to complete the payment on your phone.
                                </AlertDescription>
                              </Alert>
                            </div>
                          </TabsContent>
                          <TabsContent value="paypal">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="paypal-email">PayPal Email</Label>
                                <Input id="paypal-email" type="email" placeholder="your-email@example.com" />
                              </div>
                              <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>PayPal Payment</AlertTitle>
                                <AlertDescription>
                                  You will be redirected to PayPal to complete your payment securely.
                                </AlertDescription>
                              </Alert>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Processing..." : "Confirm Booking & Pay Deposit"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {bookingType === "safari" ? "Safari Package" : "Attraction"}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Travel Date: {travelDate ? new Date(travelDate).toLocaleDateString() : "Not specified"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Guests: {adults} adults, {children} children
                      </span>
                    </div>
                    {bookingType === "safari" && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>Accommodation: {accommodation.charAt(0).toUpperCase() + accommodation.slice(1)}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>
                        Adults ({adults} × ${item.price})
                      </span>
                      <span>${adults * item.price}</span>
                    </div>
                    {children > 0 && (
                      <div className="flex justify-between">
                        <span>
                          Children ({children} × ${Math.round(item.price * 0.7)})
                        </span>
                        <span>${children * Math.round(item.price * 0.7)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <div className="text-right">
                        <p>${totalUSD}</p>
                        <p className="text-xs text-muted-foreground">KES {totalKES.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/10 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Deposit (30%)</p>
                        <p className="text-sm text-muted-foreground">Due now</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${depositAmount}</p>
                        <p className="text-xs text-muted-foreground">KES {depositAmountKES.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-primary" />
                      <p className="text-sm">Remaining balance due 7 days before travel date</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Free cancellation up to 30 days before travel</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Secure payment processing</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>24/7 customer support</span>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

