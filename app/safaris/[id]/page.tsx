"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Users, Check, X, ChevronLeft, ChevronRight, Share2, Heart, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface Safari {
  id: string
  name: string
  description: string
  duration: string
  maxPeople: number
  image: string
  priceUSD: number
  priceKES: number
  featured: boolean
  itinerary: Array<{
    day: number
    title: string
    description: string
  }>
  included: string[]
  notIncluded: string[]
  gallery: string[]
}

export default function SafariDetailPage() {
  const { id } = useParams()
  const [safari, setSafari] = useState<Safari | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [travelDate, setTravelDate] = useState("")
  const [accommodation, setAccommodation] = useState("standard")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchSafari = async () => {
      try {
        const response = await fetch(`/api/safaris?id=${id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch safari details")
        }

        const data = await response.json()

        // Transform data to match our interface
        const transformedData = {
          ...data,
          maxPeople: data.max_people,
        }

        setSafari(transformedData)
      } catch (err) {
        setError("Error loading safari details. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    const checkLoginStatus = async () => {
      try {
        const response = await fetch("/api/auth/user")
        setIsLoggedIn(response.ok)
      } catch (error) {
        console.error("Error checking login status:", error)
        setIsLoggedIn(false)
      }
    }

    if (id) {
      fetchSafari()
      checkLoginStatus()
    }
  }, [id])

  const nextImage = () => {
    if (!safari || !safari.gallery || safari.gallery.length === 0) return
    setCurrentImageIndex((prevIndex) => (prevIndex === safari.gallery.length - 1 ? 0 : prevIndex + 1))
  }

  const prevImage = () => {
    if (!safari || !safari.gallery || safari.gallery.length === 0) return
    setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? safari.gallery.length - 1 : prevIndex - 1))
  }

  const selectImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  const handleBookNow = () => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please log in or sign up to book this safari.",
        variant: "default",
      })
      router.push(`/login?redirect=/safaris/${id}`)
      return
    }

    if (!travelDate) {
      toast({
        title: "Travel date required",
        description: "Please select a travel date to continue.",
        variant: "destructive",
      })
      return
    }

    // Calculate total price
    const adultPrice = safari?.priceUSD || 0
    const childPrice = Math.round((safari?.priceUSD || 0) * 0.7)
    const totalPriceUSD = adults * adultPrice + children * childPrice
    const totalPriceKES = adults * (safari?.priceKES || 0) + children * Math.round((safari?.priceKES || 0) * 0.7)

    // Navigate to booking page with parameters
    router.push(
      `/booking?type=safari&id=${safari?.id}&adults=${adults}&children=${children}&date=${travelDate}&accommodation=${accommodation}&totalUSD=${totalPriceUSD}&totalKES=${totalPriceKES}`,
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !safari) {
    return (
      <div className="container py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-muted-foreground mb-6">{error || "Safari not found"}</p>
          <Link href="/safaris">
            <Button>Back to Safaris</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Use image if gallery is empty
  const galleryImages = safari.gallery && safari.gallery.length > 0 ? safari.gallery : [safari.image]

  return (
    <div className="min-h-screen">
      <div className="container py-8">
        <div className="mb-6">
          <Link href="/safaris" className="text-primary flex items-center hover:underline mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Safaris
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  Safari Package
                </Badge>
                {safari.featured && <Badge variant="secondary">Featured</Badge>}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">{safari.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{safari.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>Max: {safari.maxPeople} people</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-8">
              <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden border">
                <Image
                  src={galleryImages[currentImageIndex] || "/placeholder.svg"}
                  alt={safari.name}
                  fill
                  className="object-cover"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 rounded-full"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 rounded-full"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
              {galleryImages.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {galleryImages.map((image, index) => (
                    <div
                      key={index}
                      className={`relative h-20 w-32 rounded-md overflow-hidden cursor-pointer border-2 ${currentImageIndex === index ? "border-primary" : "border-transparent"}`}
                      onClick={() => selectImage(index)}
                    >
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${safari.name} - image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="mb-8">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">About This Safari</h2>
                  <p className="text-muted-foreground whitespace-pre-line">{safari.description}</p>
                </div>

                <div className="bg-muted/30 p-6 rounded-lg border">
                  <h3 className="text-xl font-bold mb-3">Safari Highlights</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {safari.itinerary.slice(0, 4).map((day, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="bg-primary/10 text-primary font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                          {day.day}
                        </div>
                        <div>
                          <p className="font-medium">{day.title}</p>
                          <p className="text-sm text-muted-foreground">{day.description.substring(0, 100)}...</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {safari.itinerary.length > 4 && (
                    <div className="mt-4 text-center">
                      <Button variant="link" onClick={() => document.getElementById("itinerary-tab")?.click()}>
                        View Full Itinerary
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="itinerary" className="space-y-6" id="itinerary-tab">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Day-by-Day Itinerary</h2>
                  <div className="space-y-6">
                    {safari.itinerary.map((day, index) => (
                      <div key={index} className="relative pl-10 pb-6">
                        {index !== safari.itinerary.length - 1 && (
                          <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-muted-foreground/20"></div>
                        )}
                        <div className="absolute left-0 top-0 bg-primary text-primary-foreground font-bold rounded-full w-8 h-8 flex items-center justify-center">
                          {day.day}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-2">{day.title}</h3>
                          <p className="text-muted-foreground">{day.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-bold mb-3">What's Included</h3>
                    <div className="space-y-2">
                      {safari.included.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-500" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-3">What's Not Included</h3>
                    <div className="space-y-2">
                      {safari.notIncluded.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <X className="h-5 w-5 text-red-500" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-xl font-bold mb-3">Accommodation Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Standard</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Comfortable lodges and tented camps with all necessary amenities.
                        </p>
                        <p className="font-bold text-primary">${safari.priceUSD}</p>
                        <p className="text-xs text-muted-foreground">per person</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Deluxe</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Higher-end lodges with additional amenities and better locations.
                        </p>
                        <p className="font-bold text-primary">${Math.round(safari.priceUSD * 1.3)}</p>
                        <p className="text-xs text-muted-foreground">per person</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Luxury</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Premium lodges and camps with exceptional service and amenities.
                        </p>
                        <p className="font-bold text-primary">${Math.round(safari.priceUSD * 1.8)}</p>
                        <p className="text-xs text-muted-foreground">per person</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            {/* Booking Card */}
            <Card className="sticky top-20 border shadow-md">
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold mb-1">Book This Safari</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">${safari.priceUSD}</span>
                    <span className="text-muted-foreground">/ per person</span>
                  </div>
                  <p className="text-sm text-muted-foreground">KES {safari.priceKES.toLocaleString()}</p>
                </div>

                <Separator className="my-4" />

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Travel Date</label>
                    <Input
                      type="date"
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Adults</label>
                      <Select value={adults.toString()} onValueChange={(value) => setAdults(Number.parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Adults" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Children</label>
                      <Select
                        value={children.toString()}
                        onValueChange={(value) => setChildren(Number.parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Children" />
                        </SelectTrigger>
                        <SelectContent>
                          {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Accommodation Type</label>
                    <Select value={accommodation} onValueChange={setAccommodation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select accommodation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="deluxe">Deluxe</SelectItem>
                        <SelectItem value="luxury">Luxury</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span>
                        Adults ({adults} × ${safari.priceUSD})
                      </span>
                      <span>${adults * safari.priceUSD}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span>
                        Children ({children} × ${Math.round(safari.priceUSD * 0.7)})
                      </span>
                      <span>${children * Math.round(safari.priceUSD * 0.7)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex items-center justify-between font-bold">
                      <span>Total</span>
                      <div className="text-right">
                        <p>${adults * safari.priceUSD + children * Math.round(safari.priceUSD * 0.7)}</p>
                        <p className="text-sm text-muted-foreground">
                          KES{" "}
                          {(adults * safari.priceKES + children * Math.round(safari.priceKES * 0.7)).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full" onClick={handleBookNow}>
                    Book Now
                  </Button>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Info className="h-4 w-4" />
                    <span>30% deposit required to confirm booking</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}


