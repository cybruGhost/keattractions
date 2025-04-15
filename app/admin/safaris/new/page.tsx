"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, Save, Upload, LinkIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
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
import { useRef } from "react"

interface Safari {
  id?: string | number
  name: string
  location: string
  description: string
  image: string
  priceUSD: number
  priceKES: number
  featured: boolean
  duration: number
  itinerary?: string
  included?: string[]
  notIncluded?: string[]
  gallery?: string[]
}

export default function NewSafariPage() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [safari, setSafari] = useState<Safari>({
    name: "",
    location: "",
    description: "",
    image: "/placeholder.svg",
    priceUSD: 0,
    priceKES: 0,
    featured: false,
    duration: 1,
    itinerary: "",
    included: [],
    notIncluded: [],
    gallery: [],
  })

  const [saving, setSaving] = useState(false)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [imageTab, setImageTab] = useState("upload")
  const [newIncludedItem, setNewIncludedItem] = useState("")
  const [newNotIncludedItem, setNewNotIncludedItem] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSafari({ ...safari, [name]: value })
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSafari({ ...safari, [name]: Number.parseFloat(value) || 0 })
  }

  const handleSwitchChange = (checked: boolean) => {
    setSafari({ ...safari, featured: checked })
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

      // Update safari with the new image URL
      setSafari({ ...safari, image: data.url })
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

    setSafari({ ...safari, image: imageUrl })
    setShowImageDialog(false)
    setImageUrl("")
  }

  const handleAddIncludedItem = () => {
    if (!newIncludedItem.trim()) return

    setSafari({
      ...safari,
      included: [...(safari.included || []), newIncludedItem],
    })
    setNewIncludedItem("")
  }

  const handleRemoveIncludedItem = (index: number) => {
    const newIncluded = [...(safari.included || [])]
    newIncluded.splice(index, 1)
    setSafari({ ...safari, included: newIncluded })
  }

  const handleAddNotIncludedItem = () => {
    if (!newNotIncludedItem.trim()) return

    setSafari({
      ...safari,
      notIncluded: [...(safari.notIncluded || []), newNotIncludedItem],
    })
    setNewNotIncludedItem("")
  }

  const handleRemoveNotIncludedItem = (index: number) => {
    const newNotIncluded = [...(safari.notIncluded || [])]
    newNotIncluded.splice(index, 1)
    setSafari({ ...safari, notIncluded: newNotIncluded })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Make sure the image URL isn't too long
      const safeImage = safari.image && safari.image.length > 2000 ? "/placeholder.svg" : safari.image

      const safarData = {
        ...safari,
        image: safeImage, // This will be stored in image_url in the API
      }

      const response = await fetch("/api/safaris", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(safarData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to create safari: ${errorData.error || "Unknown error"}`)
      }

      toast({
        title: "Safari Created",
        description: "The safari has been successfully created.",
      })

      // Redirect to safaris list
      router.push("/admin/safaris")
    } catch (error) {
      console.error("Error saving safari:", error)
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to create safari. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-8">
          <Button variant="ghost" asChild className="mr-4">
            <Link href="/admin/safaris">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Safaris
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Add New Safari</h1>
            <p className="text-muted-foreground">Create a new safari package for your website</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Enter the basic details of the safari</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Safari Name</Label>
                    <Input id="name" name="name" value={safari.name} onChange={handleInputChange} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={safari.location}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={safari.description}
                      onChange={handleInputChange}
                      rows={6}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (days)</Label>
                    <Input
                      id="duration"
                      name="duration"
                      type="number"
                      min="1"
                      value={safari.duration}
                      onChange={handleNumberChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="itinerary">Itinerary</Label>
                    <Textarea
                      id="itinerary"
                      name="itinerary"
                      value={safari.itinerary}
                      onChange={handleInputChange}
                      rows={8}
                      placeholder="Day 1: Arrival and transfer to hotel...
Day 2: Morning game drive..."
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Included & Not Included</CardTitle>
                  <CardDescription>Specify what's included and not included in the safari package</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>What's Included</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add an included item..."
                        value={newIncludedItem}
                        onChange={(e) => setNewIncludedItem(e.target.value)}
                      />
                      <Button type="button" onClick={handleAddIncludedItem}>
                        Add
                      </Button>
                    </div>
                    <div className="mt-2">
                      {safari.included && safari.included.length > 0 ? (
                        <ul className="space-y-1">
                          {safari.included.map((item, index) => (
                            <li key={index} className="flex items-center justify-between p-2 border rounded-md">
                              <span>{item}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveIncludedItem(index)}
                              >
                                Remove
                              </Button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No items added yet</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>What's Not Included</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a not included item..."
                        value={newNotIncludedItem}
                        onChange={(e) => setNewNotIncludedItem(e.target.value)}
                      />
                      <Button type="button" onClick={handleAddNotIncludedItem}>
                        Add
                      </Button>
                    </div>
                    <div className="mt-2">
                      {safari.notIncluded && safari.notIncluded.length > 0 ? (
                        <ul className="space-y-1">
                          {safari.notIncluded.map((item, index) => (
                            <li key={index} className="flex items-center justify-between p-2 border rounded-md">
                              <span>{item}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveNotIncludedItem(index)}
                              >
                                Remove
                              </Button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No items added yet</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                  <CardDescription>Set the pricing for this safari</CardDescription>
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
                          value={safari.priceUSD}
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
                          value={safari.priceKES}
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
                  <CardDescription>Upload an image for this safari</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative aspect-video overflow-hidden rounded-lg border">
                    <Image
                      src={safari.image || "/placeholder.svg"}
                      alt={safari.name || "Safari image"}
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
                        <DialogDescription>Upload an image or provide a URL for the safari.</DialogDescription>
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
                      <Label htmlFor="featured">Featured Safari</Label>
                      <p className="text-sm text-muted-foreground">Display this safari on the homepage</p>
                    </div>
                    <Switch id="featured" checked={safari.featured} onCheckedChange={handleSwitchChange} />
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
                    {saving ? "Saving..." : "Create Safari"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

