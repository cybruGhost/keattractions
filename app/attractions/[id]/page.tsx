"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock, MapPin, Star, Users, ChevronRight, ArrowRight, Heart, Share, Info, Check } from "lucide-react"
import { use } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { ReviewForm } from "@/components/review-form"
import { ReviewList } from "@/components/review-list"

interface Attraction {
  id: string | number
  name: string
  location: string
  description: string
  longDescription?: string
  image: string
  priceUSD: number
  priceKES: number
  featured: boolean
  rating?: number | null
  reviews?: number
  duration?: number
  bestTimeToVisit?: string
  gallery: string[]
  activities?: string[]
  included?: string[]
  notIncluded?: string[]
}

export default function AttractionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const resolvedParams = use(params)

  const [attraction, setAttraction] = useState<Attraction | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [date, setDate] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [similarAttractions, setSimilarAttractions] = useState<Attraction[]>([])
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0)
  const [showReviewForm, setShowReviewForm] = useState(false)

  useEffect(() => {
    const fetchAttraction = async () => {
      try {
        const response = await fetch(`/api/attractions?id=${resolvedParams.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch attraction")
        }

        const data = await response.json()

        // Parse JSON strings to arrays if needed
        const parsedData = { ...data }

        if (typeof data.gallery === "string") {
          try {
            parsedData.gallery = JSON.parse(data.gallery)
          } catch (e) {
            parsedData.gallery = []
          }
        }

        if (typeof data.activities === "string") {
          try {
            parsedData.activities = JSON.parse(data.activities)
          } catch (e) {
            parsedData.activities = []
          }
        }

        if (typeof data.included === "string") {
          try {
            parsedData.included = JSON.parse(data.included)
          } catch (e) {
            parsedData.included = []
          }
        }

        if (typeof data.notIncluded === "string") {
          try {
            parsedData.notIncluded = JSON.parse(data.notIncluded)
          } catch (e) {
            parsedData.notIncluded = []
          }
        }

        setAttraction(parsedData)
      } catch (error) {
        console.error("Error fetching attraction:", error)
        setError("Failed to load attraction details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchAttraction()
  }, [resolvedParams.id, toast])

  useEffect(() => {
    if (attraction) {
      fetchSimilarAttractions().then(setSimilarAttractions)
    }
  }, [attraction])

  const handleBookNow = () => {
    if (!attraction) return

    const queryParams = new URLSearchParams({
      type: "attraction",
      id: attraction.id.toString(),
      adults: adults.toString(),
      children: children.toString(),
      date: date,
      totalUSD: (adults * attraction.priceUSD + children * Math.round(attraction.priceUSD * 0.7)).toString(),
      totalKES: (adults * attraction.priceKES + children * Math.round(attraction.priceKES * 0.7)).toString(),
    })

    router.push(`/booking?${queryParams.toString()}`)
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

  if (error || !attraction) {
    return (
      <div className="container py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Attraction Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {error || "The attraction you're looking for doesn't exist or has been removed."}
          </p>
          <Button asChild>
            <Link href="/attractions">Browse All Attractions</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Ensure gallery is an array
  const galleryImages = Array.isArray(attraction.gallery) ? attraction.gallery : []

  // Ensure activities is an array
  const activities = Array.isArray(attraction.activities) ? attraction.activities : []

  // Ensure included is an array
  const included = Array.isArray(attraction.included) ? attraction.included : []

  // Ensure notIncluded is an array
  const notIncluded = Array.isArray(attraction.notIncluded) ? attraction.notIncluded : []

  // Get current image (main image or from gallery)
  const currentImage =
    currentImageIndex === 0 ? attraction.image : galleryImages[currentImageIndex - 1] || attraction.image

  // Format rating safely
  const formattedRating =
    attraction.rating && typeof attraction.rating === "number" ? attraction.rating.toFixed(1) : "0.0"

  const fetchSimilarAttractions = async () => {
    try {
      // Fetch similar attractions based on location or category
      const response = await fetch(
        `/api/attractions/similar?id=${resolvedParams.id}&location=${encodeURIComponent(attraction.location)}`,
      )

      if (!response.ok) {
        return []
      }

      const data = await response.json()
      return data.slice(0, 3) // Limit to 3 similar attractions
    } catch (error) {
      console.error("Error fetching similar attractions:", error)
      return []
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Breadcrumb */}
      <div className="bg-background border-b">
        <div className="container py-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <Link href="/attractions" className="hover:text-foreground">
              Attractions
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-foreground font-medium truncate">{attraction.name}</span>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold mb-2">{attraction.name}</h1>

            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-muted-foreground mr-1" />
                <span>{attraction.location}</span>
              </div>

              {attraction.rating !== null && attraction.rating !== undefined && (
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                  <span>{formattedRating}</span>
                  {attraction.reviews && (
                    <span className="text-muted-foreground ml-1">({attraction.reviews} reviews)</span>
                  )}
                </div>
              )}

              {attraction.duration && (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                  <span>
                    {attraction.duration} {attraction.duration === 1 ? "hour" : "hours"}
                  </span>
                </div>
              )}
            </div>

            <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-4">
              <Image src={currentImage || "/placeholder.svg"} alt={attraction.name} fill className="object-cover" />
            </div>

            {galleryImages.length > 0 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                <div
                  className={`relative h-20 w-32 rounded-md overflow-hidden cursor-pointer border-2 ${currentImageIndex === 0 ? "border-primary" : "border-transparent"}`}
                  onClick={() => setCurrentImageIndex(0)}
                >
                  <Image
                    src={attraction.image || "/placeholder.svg"}
                    alt={attraction.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {galleryImages.map((image, index) => (
                  <div
                    key={index}
                    className={`relative h-20 w-32 rounded-md overflow-hidden cursor-pointer border-2 ${currentImageIndex === index + 1 ? "border-primary" : "border-transparent"}`}
                    onClick={() => setCurrentImageIndex(index + 1)}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${attraction.name} - image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            <Tabs defaultValue="overview" className="mt-8">
              <TabsList className="grid grid-cols-3 w-full max-w-md">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-3">Description</h2>
                    <p className="text-muted-foreground">{attraction.description}</p>
                  </div>

                  {attraction.longDescription && (
                    <div>
                      <p className="text-muted-foreground">{attraction.longDescription}</p>
                    </div>
                  )}

                  {activities.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold mb-3">Activities</h2>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {activities.map((activity, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-primary"></div>
                            <span>{activity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="details" className="mt-6">
                <div className="space-y-6">
                  {attraction.bestTimeToVisit && (
                    <div>
                      <h2 className="text-xl font-bold mb-3">Best Time to Visit</h2>
                      <p className="text-muted-foreground">{attraction.bestTimeToVisit}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {included.length > 0 && (
                      <div>
                        <h2 className="text-lg font-bold mb-3">What's Included</h2>
                        <ul className="space-y-2">
                          {included.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-green-500 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {notIncluded.length > 0 && (
                      <div>
                        <h2 className="text-lg font-bold mb-3">Not Included</h2>
                        <ul className="space-y-2">
                          {notIncluded.map((item, index) => (
                            <li key={index} className="flex items-start gap-2 text-muted-foreground">
                              <Info className="h-5 w-5 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div>
                    <h2 className="text-xl font-bold mb-3">Location</h2>
                    <div className="aspect-[16/9] bg-muted rounded-lg flex items-center justify-center">
                      <MapPin className="h-8 w-8 text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground">Map view will be displayed here</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Reviews</h2>
                    <Button variant="outline" onClick={() => setShowReviewForm(!showReviewForm)}>
                      {showReviewForm ? "Cancel" : "Write a Review"}
                    </Button>
                  </div>

                  {showReviewForm && (
                    <Card className="mb-6">
                      <CardContent className="pt-6">
                        <ReviewForm
                          attractionId={attraction.id.toString()}
                          onReviewSubmitted={() => {
                            setReviewRefreshTrigger((prev) => prev + 1)
                            setShowReviewForm(false)
                          }}
                        />
                      </CardContent>
                    </Card>
                  )}

                  <ReviewList attractionId={attraction.id.toString()} refreshTrigger={reviewRefreshTrigger} />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-2xl font-bold">${attraction.priceUSD}</p>
                    <p className="text-sm text-muted-foreground">KES {attraction.priceKES.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center">
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Heart className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Share className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-4">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium mb-1">
                      Select Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="adults" className="block text-sm font-medium mb-1">
                        Adults
                      </label>
                      <select
                        id="adults"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={adults}
                        onChange={(e) => setAdults(Number.parseInt(e.target.value))}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? "Adult" : "Adults"}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="children" className="block text-sm font-medium mb-1">
                        Children
                      </label>
                      <select
                        id="children"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={children}
                        onChange={(e) => setChildren(Number.parseInt(e.target.value))}
                      >
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? "Child" : "Children"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>
                      Adults ({adults} × ${attraction.priceUSD})
                    </span>
                    <span>${adults * attraction.priceUSD}</span>
                  </div>
                  {children > 0 && (
                    <div className="flex justify-between">
                      <span>
                        Children ({children} × ${Math.round(attraction.priceUSD * 0.7)})
                      </span>
                      <span>${children * Math.round(attraction.priceUSD * 0.7)}</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <div className="text-right">
                      <p>${adults * attraction.priceUSD + children * Math.round(attraction.priceUSD * 0.7)}</p>
                      <p className="text-xs text-muted-foreground">
                        KES{" "}
                        {(
                          adults * attraction.priceKES +
                          children * Math.round(attraction.priceKES * 0.7)
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <Button className="w-full mt-6" onClick={handleBookNow}>
                  Book Now
                </Button>

                <div className="mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span>Free cancellation up to 24 hours before</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Instant confirmation</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Similar Attractions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarAttractions.length === 0 ? (
              <div className="col-span-3 text-center py-8 border rounded-lg">
                <p className="text-muted-foreground">No similar attractions found</p>
              </div>
            ) : (
              similarAttractions.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="relative h-48">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold mb-1">{item.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{item.location}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="font-bold">${item.priceUSD}</p>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/attractions/${item.id}`}>
                          View
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

