"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { MapPin, DollarSign, Search, Filter, ArrowRight, Calendar, Users, Star, ChevronDown, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface Attraction {
  id: string
  name: string
  location: string
  description: string
  image: string
  priceUSD: number
  priceKES: number
  featured: boolean
}

export default function AttractionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [attractions, setAttractions] = useState<Attraction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [priceFilter, setPriceFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const [locations, setLocations] = useState<string[]>([])
  const [activeFilters, setActiveFilters] = useState(0)

  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        const response = await fetch("/api/attractions")

        if (!response.ok) {
          throw new Error("Failed to fetch attractions")
        }

        const data = await response.json()
        setAttractions(data)

        // Extract unique locations for filter
        const uniqueLocations = Array.from(
          new Set(data.map((attraction: Attraction) => attraction.location)),
        ) as string[]

        setLocations(uniqueLocations)
      } catch (error) {
        console.error("Error fetching attractions:", error)
        toast({
          title: "Error",
          description: "Failed to load attractions. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAttractions()
  }, [toast])

  useEffect(() => {
    // Count active filters
    let count = 0
    if (searchQuery) count++
    if (locationFilter !== "all") count++
    if (priceFilter !== "all") count++
    setActiveFilters(count)
  }, [searchQuery, locationFilter, priceFilter])

  const filteredAttractions = attractions.filter((attraction) => {
    // Apply search filter
    const matchesSearch =
      attraction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attraction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attraction.location.toLowerCase().includes(searchQuery.toLowerCase())

    // Apply location filter
    const matchesLocation = locationFilter === "all" || attraction.location === locationFilter

    // Apply price filter
    let matchesPrice = true
    if (priceFilter === "under-50") {
      matchesPrice = attraction.priceUSD < 50
    } else if (priceFilter === "50-100") {
      matchesPrice = attraction.priceUSD >= 50 && attraction.priceUSD <= 100
    } else if (priceFilter === "100-200") {
      matchesPrice = attraction.priceUSD > 100 && attraction.priceUSD <= 200
    } else if (priceFilter === "over-200") {
      matchesPrice = attraction.priceUSD > 200
    }

    return matchesSearch && matchesLocation && matchesPrice
  })

  const resetFilters = () => {
    setSearchQuery("")
    setLocationFilter("all")
    setPriceFilter("all")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 py-12">
        <div className="container">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero Section */}
      <div className="relative h-[40vh] md:h-[50vh] bg-black">
        <video
          src="/placeholder.svg?height=1080&width=1920"
          alt="Kenya Attractions"
          fill
          className="object-cover opacity-70"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Discover Kenya's Attractions</h1>
          <p className="text-xl md:text-2xl text-center max-w-3xl">
            Explore the beauty and wonder of Kenya's most breathtaking destinations
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="sticky top-0 z-10 bg-background border-b shadow-sm">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-auto md:flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search attractions by name or location..."
                className="pl-10 pr-4 py-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                    {activeFilters > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {activeFilters}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>Refine your search with these filters</SheetDescription>
                  </SheetHeader>
                  <div className="py-6 space-y-6">
                    <Accordion type="single" collapsible defaultValue="location">
                      <AccordionItem value="location">
                        <AccordionTrigger>Location</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pt-2">
                            <div className="grid grid-cols-1 gap-2">
                              <Button
                                variant={locationFilter === "all" ? "default" : "outline"}
                                className="justify-start"
                                onClick={() => setLocationFilter("all")}
                              >
                                All Locations
                              </Button>
                              {locations.map((location) => (
                                <Button
                                  key={location}
                                  variant={locationFilter === location ? "default" : "outline"}
                                  className="justify-start"
                                  onClick={() => setLocationFilter(location)}
                                >
                                  {location}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="price">
                        <AccordionTrigger>Price Range</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pt-2">
                            <div className="grid grid-cols-1 gap-2">
                              <Button
                                variant={priceFilter === "all" ? "default" : "outline"}
                                className="justify-start"
                                onClick={() => setPriceFilter("all")}
                              >
                                All Prices
                              </Button>
                              <Button
                                variant={priceFilter === "under-50" ? "default" : "outline"}
                                className="justify-start"
                                onClick={() => setPriceFilter("under-50")}
                              >
                                Under $50
                              </Button>
                              <Button
                                variant={priceFilter === "50-100" ? "default" : "outline"}
                                className="justify-start"
                                onClick={() => setPriceFilter("50-100")}
                              >
                                $50 - $100
                              </Button>
                              <Button
                                variant={priceFilter === "100-200" ? "default" : "outline"}
                                className="justify-start"
                                onClick={() => setPriceFilter("100-200")}
                              >
                                $100 - $200
                              </Button>
                              <Button
                                variant={priceFilter === "over-200" ? "default" : "outline"}
                                className="justify-start"
                                onClick={() => setPriceFilter("over-200")}
                              >
                                Over $200
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                  <div className="flex flex-col gap-3 mt-auto">
                    <Button variant="outline" onClick={resetFilters}>
                      Reset All Filters
                    </Button>
                    <SheetClose asChild>
                      <Button>Apply Filters</Button>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>

              <Select value={locationFilter} onValueChange={setLocationFilter} className="hidden md:flex">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priceFilter} onValueChange={setPriceFilter} className="hidden md:flex">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Prices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under-50">Under $50</SelectItem>
                  <SelectItem value="50-100">$50 - $100</SelectItem>
                  <SelectItem value="100-200">$100 - $200</SelectItem>
                  <SelectItem value="over-200">Over $200</SelectItem>
                </SelectContent>
              </Select>

              {activeFilters > 0 && (
                <Button variant="ghost" size="sm" onClick={resetFilters} className="hidden md:flex">
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters */}
          {activeFilters > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchQuery}
                  <button onClick={() => setSearchQuery("")}>
                    <X className="h-3 w-3 ml-1" />
                  </button>
                </Badge>
              )}
              {locationFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Location: {locationFilter}
                  <button onClick={() => setLocationFilter("all")}>
                    <X className="h-3 w-3 ml-1" />
                  </button>
                </Badge>
              )}
              {priceFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Price: {priceFilter.replace("-", " to $").replace("under-", "Under $").replace("over-", "Over $")}
                  <button onClick={() => setPriceFilter("all")}>
                    <X className="h-3 w-3 ml-1" />
                  </button>
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={resetFilters} className="h-6">
                Clear All
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {filteredAttractions.length} {filteredAttractions.length === 1 ? "Attraction" : "Attractions"} Found
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden md:inline">Sort by:</span>
            <Select defaultValue="featured">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredAttractions.length === 0 ? (
          <div className="bg-background rounded-lg border p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No attractions found</h3>
            <p className="text-muted-foreground mb-6">
              We couldn't find any attractions matching your current filters.
            </p>
            <Button onClick={resetFilters}>Reset All Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAttractions.map((attraction) => (
              <Link key={attraction.id} href={`/attractions/${attraction.id}`} className="group">
                <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg">
                  <div className="relative">
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={attraction.image || "/placeholder.svg"}
                        alt={attraction.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    {attraction.featured && <Badge className="absolute top-4 right-4 bg-primary">Featured</Badge>}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                      <h3 className="text-xl font-bold mb-1 group-hover:text-primary-foreground transition-colors">
                        {attraction.name}
                      </h3>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-1 text-primary-foreground" />
                        {attraction.location}
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-bold text-lg flex items-center">
                          <DollarSign className="h-4 w-4" />
                          {attraction.priceUSD}
                        </p>
                        <p className="text-xs text-muted-foreground">KES {attraction.priceKES.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center">
                        <div className="flex items-center bg-primary/10 text-primary rounded-full px-2 py-1">
                          <Star className="h-3 w-3 fill-primary mr-1" />
                          <span className="text-xs font-medium">4.8</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-muted-foreground line-clamp-3 mb-4">{attraction.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Daily</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>All ages</span>
                        </div>
                      </div>
                      <Button size="sm" className="group-hover:bg-primary transition-colors">
                        View
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {filteredAttractions.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Button variant="outline" size="lg" className="gap-2">
              Load More Attractions
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Featured Experiences Section */}
      <div className="bg-muted py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Experiences</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background rounded-lg overflow-hidden shadow-md">
              <div className="relative h-48">
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  alt="Safari Experience"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Safari Adventures</h3>
                <p className="text-muted-foreground mb-4">
                  Experience the thrill of seeing Africa's majestic wildlife in their natural habitat.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/safaris">
                    Explore Safaris
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="bg-background rounded-lg overflow-hidden shadow-md">
              <div className="relative h-48">
                <Image src="/placeholder.svg?height=400&width=600" alt="Cultural Tours" fill className="object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Cultural Tours</h3>
                <p className="text-muted-foreground mb-4">
                  Immerse yourself in Kenya's rich cultural heritage and traditions.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/cultural-tours">
                    Discover Culture
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="bg-background rounded-lg overflow-hidden shadow-md">
              <div className="relative h-48">
                <Image src="/placeholder.svg?height=400&width=600" alt="Beach Getaways" fill className="object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Beach Getaways</h3>
                <p className="text-muted-foreground mb-4">
                  Relax on Kenya's pristine beaches along the Indian Ocean coastline.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/beaches">
                    Explore Beaches
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Travel Tips Section */}
      <div className="container py-16">
        <div className="bg-background border rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Travel Tips for Kenya</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="bg-primary/10 p-3 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold mb-1">Best Time to Visit</h3>
                <p className="text-muted-foreground">
                  The best time to visit Kenya is during the dry seasons: January to March and July to October.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 p-3 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold mb-1">Currency</h3>
                <p className="text-muted-foreground">
                  The Kenyan Shilling (KES) is the local currency. Major credit cards are accepted in most tourist
                  areas.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 p-3 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold mb-1">Language</h3>
                <p className="text-muted-foreground">
                  English and Swahili are the official languages. Most people in tourist areas speak English.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 p-3 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold mb-1">Getting Around</h3>
                <p className="text-muted-foreground">
                  Domestic flights, car rentals, and guided tours are the best ways to travel between destinations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

