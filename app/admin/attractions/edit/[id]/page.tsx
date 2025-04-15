"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Save, ArrowLeft, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Attraction {
  id: string
  name: string
  location: string
  coordinates: { lat: number; lng: number }
  image: string
  gallery: string[]
  rating: number
  reviews: number
  priceUSD: number
  priceKES: number
  featured: boolean
  category: string
  description: string
  longDescription: string
  activities: string[]
  bestTimeToVisit: string
  duration: string
  included: string[]
  notIncluded: string[]
}

export default function EditAttractionPage() {
  const { id } = useParams()
  const [attraction, setAttraction] = useState<Attraction | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Form state
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [longDescription, setLongDescription] = useState("")
  const [priceUSD, setPriceUSD] = useState(0)
  const [priceKES, setPriceKES] = useState(0)
  const [featured, setFeatured] = useState(false)
  const [image, setImage] = useState("")
  const [lat, setLat] = useState(0)
  const [lng, setLng] = useState(0)
  const [rating, setRating] = useState(0)
  const [reviews, setReviews] = useState(0)
  const [bestTimeToVisit, setBestTimeToVisit] = useState("")
  const [duration, setDuration] = useState("")

  // Arrays
  const [galleryString, setGalleryString] = useState("")
  const [activitiesString, setActivitiesString] = useState("")
  const [includedString, setIncludedString] = useState("")
  const [notIncludedString, setNotIncludedString] = useState("")

  useEffect(() => {
    if (id) {
      fetchAttraction()
    }
  }, [id])

  const fetchAttraction = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/attractions?id=${id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch attraction")
      }

      const data = await response.json()
      setAttraction(data)

      // Populate form fields
      setName(data.name)
      setLocation(data.location)
      setCategory(data.category)
      setDescription(data.description)
      setLongDescription(data.longDescription || "")
      setPriceUSD(data.priceUSD)
      setPriceKES(data.priceKES)
      setFeatured(data.featured)
      setImage(data.image)
      setLat(data.coordinates?.lat || 0)
      setLng(data.coordinates?.lng || 0)
      setRating(data.rating || 0)
      setReviews(data.reviews || 0)
      setBestTimeToVisit(data.bestTimeToVisit || "")
      setDuration(data.duration || "")

      // Convert arrays to strings for editing
      setGalleryString(data.gallery?.join("\n") || "")
      setActivitiesString(data.activities?.join("\n") || "")
      setIncludedString(data.included?.join("\n") || "")
      setNotIncludedString(data.notIncluded?.join("\n") || "")
    } catch (error) {
      console.error("Error fetching attraction:", error)
      setError("Failed to load attraction. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)

      // Convert string inputs back to arrays
      const gallery = galleryString.split("\n").filter((item) => item.trim() !== "")
      const activities = activitiesString.split("\n").filter((item) => item.trim() !== "")
      const included = includedString.split("\n").filter((item) => item.trim() !== "")
      const notIncluded = notIncludedString.split("\n").filter((item) => item.trim() !== "")

      const updatedAttraction = {
        id,
        name,
        location,
        coordinates: { lat, lng },
        image,
        gallery,
        rating,
        reviews,
        priceUSD,
        priceKES,
        featured,
        category,
        description,
        longDescription,
        activities,
        bestTimeToVisit,
        duration,
        included,
        notIncluded,
      }

      const response = await fetch(`/api/attractions?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedAttraction),
      })

      if (!response.ok) {
        throw new Error("Failed to update attraction")
      }

      toast({
        title: "Attraction updated",
        description: "The attraction has been successfully updated.",
      })

      router.push("/admin/attractions/manage")
    } catch (error) {
      console.error("Error updating attraction:", error)
      toast({
        title: "Error",
        description: "Failed to update attraction. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => router.push("/admin/attractions/manage")}>Back to Attractions</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Edit Attraction</h1>
          <Button variant="outline" onClick={() => router.push("/admin/attractions/manage")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic">
            <TabsList className="mb-6">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="media">Media & Location</TabsTrigger>
              <TabsTrigger value="features">Features & Inclusions</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Edit the basic details of the attraction</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Attraction Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priceUSD">Price (USD)</Label>
                      <Input
                        id="priceUSD"
                        type="number"
                        value={priceUSD}
                        onChange={(e) => setPriceUSD(Number(e.target.value))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priceKES">Price (KES)</Label>
                      <Input
                        id="priceKES"
                        type="number"
                        value={priceKES}
                        onChange={(e) => setPriceKES(Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="featured" checked={featured} onCheckedChange={setFeatured} />
                    <Label htmlFor="featured">Featured Attraction</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Information</CardTitle>
                  <CardDescription>Edit the detailed description and information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Short Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longDescription">Detailed Description</Label>
                    <Textarea
                      id="longDescription"
                      value={longDescription}
                      onChange={(e) => setLongDescription(e.target.value)}
                      rows={8}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bestTimeToVisit">Best Time to Visit</Label>
                      <Input
                        id="bestTimeToVisit"
                        value={bestTimeToVisit}
                        onChange={(e) => setBestTimeToVisit(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Input id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rating">Rating (0-5)</Label>
                      <Input
                        id="rating"
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reviews">Number of Reviews</Label>
                      <Input
                        id="reviews"
                        type="number"
                        min="0"
                        value={reviews}
                        onChange={(e) => setReviews(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media">
              <Card>
                <CardHeader>
                  <CardTitle>Media & Location</CardTitle>
                  <CardDescription>Edit images and location information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="image">Main Image URL</Label>
                    <Input id="image" value={image} onChange={(e) => setImage(e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gallery">Gallery Images (one URL per line)</Label>
                    <Textarea
                      id="gallery"
                      value={galleryString}
                      onChange={(e) => setGalleryString(e.target.value)}
                      rows={5}
                      placeholder="https://example.com/image1.jpg
https://example.com/image2.jpg"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lat">Latitude</Label>
                      <Input
                        id="lat"
                        type="number"
                        step="any"
                        value={lat}
                        onChange={(e) => setLat(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lng">Longitude</Label>
                      <Input
                        id="lng"
                        type="number"
                        step="any"
                        value={lng}
                        onChange={(e) => setLng(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features">
              <Card>
                <CardHeader>
                  <CardTitle>Features & Inclusions</CardTitle>
                  <CardDescription>Edit activities and what's included</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="activities">Activities (one per line)</Label>
                    <Textarea
                      id="activities"
                      value={activitiesString}
                      onChange={(e) => setActivitiesString(e.target.value)}
                      rows={5}
                      placeholder="Game drives
Hot air balloon safaris
Cultural visits"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="included">What's Included (one per line)</Label>
                    <Textarea
                      id="included"
                      value={includedString}
                      onChange={(e) => setIncludedString(e.target.value)}
                      rows={5}
                      placeholder="Park entrance fees
Professional guide
Transportation"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notIncluded">What's Not Included (one per line)</Label>
                    <Textarea
                      id="notIncluded"
                      value={notIncludedString}
                      onChange={(e) => setNotIncludedString(e.target.value)}
                      rows={5}
                      placeholder="International flights
Visa fees
Personal expenses"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={saving} className="gap-2">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

