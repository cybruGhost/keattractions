"use client"

import type React from "react"
import { use } from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, Save, Trash2, Upload, MapPin, LinkIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Attraction {
  id: string | number
  name: string
  location: string
  description: string
  image: string
  priceUSD: number
  priceKES: number
  featured: boolean
  category?: string
  rating?: number
  reviews?: number
  duration?: number
  lat?: number
  lng?: number
}

export default function EditAttractionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const resolvedParams = use(params)
  const isNewAttraction = resolvedParams.id === "new"
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [attraction, setAttraction] = useState<Attraction>({
    id: isNewAttraction ? "" : resolvedParams.id,
    name: "",
    location: "",
    description: "",
    image: "/placeholder.svg",
    priceUSD: 0,
    priceKES: 0,
    featured: false,
    category: "General",
    rating: 0,
    reviews: 0,
    duration: 1,
    lat: 0,
    lng: 0,
  })

  const [loading, setLoading] = useState(!isNewAttraction)
  const [saving, setSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [imageTab, setImageTab] = useState("upload")

  useEffect(() => {
    if (!isNewAttraction) {
      const fetchAttraction = async () => {
        try {
          const response = await fetch(`/api/attractions?id=${resolvedParams.id}`)

          if (!response.ok) {
            throw new Error("Failed to fetch attraction")
          }

          const data = await response.json()
          setAttraction(data)
        } catch (error) {
          console.error("Error fetching attraction:", error)
          toast({
            title: "Error",
            description: "Failed to load attraction. Please try again.",
            variant: "destructive",
          })
        } finally {
          setLoading(false)
        }
      }

      fetchAttraction()
    }
  }, [isNewAttraction, resolvedParams.id, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setAttraction({ ...attraction, [name]: value })
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAttraction({ ...attraction, [name]: Number.parseFloat(value) || 0 })
  }

  const handleSwitchChange = (checked: boolean) => {
    setAttraction({ ...attraction, featured: checked })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Create form data
      const formData = new FormData()
      formData.append("file", file)

      // Upload the file
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload image")
      }

      const data = await response.json()

      // Update attraction with the new image URL
      setAttraction({ ...attraction, image: data.url })
      setShowImageDialog(false)

      toast({
        title: "Image Uploaded",
        description: "Image has been uploaded successfully.",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleImageUrlSubmit = () => {
    if (!imageUrl) return

    // Basic URL validation
    try {
      new URL(imageUrl)
      setAttraction({ ...attraction, image: imageUrl })
      setShowImageDialog(false)
      setImageUrl("")
    } catch (e) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid image URL",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const method = isNewAttraction ? "POST" : "PUT"
      const url = isNewAttraction ? "/api/attractions" : `/api/attractions?id=${resolvedParams.id}`

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attraction),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          `Failed to ${isNewAttraction ? "create" : "update"} attraction: ${errorData.error || "Unknown error"}`,
        )
      }

      toast({
        title: isNewAttraction ? "Attraction Created" : "Attraction Updated",
        description: `The attraction has been successfully ${isNewAttraction ? "created" : "updated"}.`,
      })

      // Redirect to attractions list
      router.push("/admin/attractions")
    } catch (error) {
      console.error("Error saving attraction:", error)
      toast({
        title: "Save Failed",
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${isNewAttraction ? "create" : "update"} attraction. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/attractions?id=${resolvedParams.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete attraction")
      }

      toast({
        title: "Attraction Deleted",
        description: "The attraction has been successfully deleted.",
      })

      // Redirect to attractions list
      router.push("/admin/attractions")
    } catch (error) {
      console.error("Error deleting attraction:", error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete attraction. Please try again.",
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

  return (
    <div className="container py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-8">
          <Button variant="ghost" asChild className="mr-4">
            <Link href="/admin/attractions">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Attractions
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{isNewAttraction ? "Add New Attraction" : "Edit Attraction"}</h1>
            <p className="text-muted-foreground">
              {isNewAttraction ? "Create a new attraction for your website" : "Update the details of this attraction"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Enter the basic details of the attraction</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Attraction Name</Label>
                    <Input id="name" name="name" value={attraction.name} onChange={handleInputChange} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={attraction.location}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={attraction.description}
                      onChange={handleInputChange}
                      rows={6}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input id="category" name="category" value={attraction.category} onChange={handleInputChange} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (hours)</Label>
                      <Input
                        id="duration"
                        name="duration"
                        type="number"
                        min="0"
                        step="0.5"
                        value={attraction.duration}
                        onChange={handleNumberChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lat">Latitude</Label>
                      <Input
                        id="lat"
                        name="lat"
                        type="number"
                        step="any"
                        value={attraction.lat}
                        onChange={handleNumberChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lng">Longitude</Label>
                      <Input
                        id="lng"
                        name="lng"
                        type="number"
                        step="any"
                        value={attraction.lng}
                        onChange={handleNumberChange}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Map Location</Label>
                      <p className="text-sm text-muted-foreground">View on map</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" className="gap-2">
                      <MapPin className="h-4 w-4" />
                      View on Map
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                  <CardDescription>Set the pricing for this attraction</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priceUSD">Price (USD)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5">$</span>
                        <Input
                          id="priceUSD"
                          name="priceUSD"
                          type="number"
                          min="0"
                          step="0.01"
                          className="pl-7"
                          value={attraction.priceUSD}
                          onChange={handleNumberChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priceKES">Price (KES)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5">KES</span>
                        <Input
                          id="priceKES"
                          name="priceKES"
                          type="number"
                          min="0"
                          step="1"
                          className="pl-12"
                          value={attraction.priceKES}
                          onChange={handleNumberChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Image</CardTitle>
                  <CardDescription>Upload an image for this attraction</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative aspect-video overflow-hidden rounded-lg border">
                    <Image
                      src={attraction.image || "/placeholder.svg"}
                      alt={attraction.name || "Attraction image"}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />

                  <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Change Image
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Image</DialogTitle>
                        <DialogDescription>Upload an image or provide a URL for the attraction.</DialogDescription>
                      </DialogHeader>

                      <Tabs defaultValue="upload" value={imageTab} onValueChange={setImageTab}>
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="upload">Upload File</TabsTrigger>
                          <TabsTrigger value="url">Image URL</TabsTrigger>
                        </TabsList>
                        <TabsContent value="upload" className="py-4">
                          <div className="space-y-4">
                            <div
                              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground mb-1">Click to upload or drag and drop</p>
                              <p className="text-xs text-muted-foreground">PNG, JPG or WEBP (max. 2MB)</p>
                            </div>
                            <Button type="button" className="w-full" onClick={() => fileInputRef.current?.click()}>
                              Select File
                            </Button>
                          </div>
                        </TabsContent>
                        <TabsContent value="url" className="py-4">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="image-url">Image URL</Label>
                              <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                  <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    id="image-url"
                                    placeholder="https://example.com/image.jpg"
                                    className="pl-9"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>
                            <Button
                              type="button"
                              className="w-full"
                              onClick={handleImageUrlSubmit}
                              disabled={!imageUrl}
                            >
                              Use Image URL
                            </Button>
                          </div>
                        </TabsContent>
                      </Tabs>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowImageDialog(false)}>
                          Cancel
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <p className="text-xs text-muted-foreground text-center">
                    Recommended size: 1200x800px. Max size: 2MB.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                  <CardDescription>Configure additional settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="featured">Featured Attraction</Label>
                      <p className="text-sm text-muted-foreground">Display this attraction on the homepage</p>
                    </div>
                    <Switch id="featured" checked={attraction.featured} onCheckedChange={handleSwitchChange} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rating">Rating</Label>
                      <Input
                        id="rating"
                        name="rating"
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={attraction.rating}
                        onChange={handleNumberChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reviews">Reviews Count</Label>
                      <Input
                        id="reviews"
                        name="reviews"
                        type="number"
                        min="0"
                        step="1"
                        value={attraction.reviews}
                        onChange={handleNumberChange}
                      />
                    </div>
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
                    {saving ? "Saving..." : "Save Attraction"}
                  </Button>

                  {!isNewAttraction && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full text-red-500 hover:text-red-600"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Attraction
                    </Button>
                  )}
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
                This action cannot be undone. This will permanently delete the attraction and remove it from our
                servers.
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
      </div>
    </div>
  )
}

