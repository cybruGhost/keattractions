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

interface Safari {
  id: string
  name: string
  location: string
  description: string
  image: string
  image_url?: string
  priceUSD: number
  priceKES: number
  featured: boolean
  duration: number
}

export default function SafarisPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [safaris, setSafaris] = useState<Safari[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [priceFilter, setPriceFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const [durationFilter, setDurationFilter] = useState("all")
  const [locations, setLocations] = useState<string[]>([])
  const [activeFilters, setActiveFilters] = useState(0)

  useEffect(() => {
    const fetchSafaris = async () => {
      try {
        const response = await fetch("/api/safaris")

        if (!response.ok) {
          throw new Error("Failed to fetch safaris")
        }

        const data = await response.json()
        setSafaris(data)

        // Extract unique locations for filter
        const uniqueLocations = Array.from(new Set(data.map((safari: Safari) => safari.location))) as string[]

        setLocations(uniqueLocations)
      } catch (error) {
        console.error("Error fetching safaris:", error)
        toast({
          title: "Error",
          description: "Failed to load safaris. Please try again.",
          variant: "destructive",
        })

        // For demo purposes, let's add some sample data if the API fails
        const sampleSafaris: Safari[] = [
          {
            id: "1",
            name: "Maasai Mara Safari",
            location: "Maasai Mara",
            description:
              "Experience the incredible wildlife of the Maasai Mara National Reserve, home to the Big Five and the Great Migration.",
            image: "/placeholder.svg?height=400&width=600",
            priceUSD: 350,
            priceKES: 45500,
            featured: true,
            duration: 3,
          },
          {
            id: "2",
            name: "Amboseli National Park Safari",
            location: "Amboseli",
            description:
              "Enjoy breathtaking views of Mount Kilimanjaro while spotting elephants and other wildlife in their natural habitat.",
            image: "/placeholder.svg?height=400&width=600",
            priceUSD: 280,
            priceKES: 36400,
            featured: false,
            duration: 2,
          },
          {
            id: "3",
            name: "Tsavo East & West Safari",
            location: "Tsavo",
            description:
              "Explore Kenya's largest national park, known for its red elephants, diverse landscapes, and abundant wildlife.",
            image: "/placeholder.svg?height=400&width=600",
            priceUSD: 420,
            priceKES: 54600,
            featured: true,
            duration: 4,
          },
          {
            id: "4",
            name: "Lake Nakuru Safari",
            location: "Lake Nakuru",
            description:
              "Visit the famous Lake Nakuru, known for its flamingos and rhino sanctuary, offering a unique safari experience.",
            image: "/placeholder.svg?height=400&width=600",
            priceUSD: 250,
            priceKES: 32500,
            featured: false,
            duration: 2,
          },
          {
            id: "5",
            name: "Samburu National Reserve Safari",
            location: "Samburu",
            description:
              "Discover the unique wildlife of Samburu, including the 'Samburu Special Five' found only in this northern region.",
            image: "/placeholder.svg?height=400&width=600",
            priceUSD: 380,
            priceKES: 49400,
            featured: true,
            duration: 3,
          },
          {
            id: "6",
            name: "Meru National Park Safari",
            location: "Meru",
            description:
              "Explore the diverse landscapes of Meru National Park, from woodlands to open plains, home to a variety of wildlife.",
            image: "/placeholder.svg?height=400&width=600",
            priceUSD: 320,
            priceKES: 41600,
            featured: false,
            duration: 3,
          },
        ]

        setSafaris(sampleSafaris)
        setLocations(["Maasai Mara", "Amboseli", "Tsavo", "Lake Nakuru", "Samburu", "Meru"])
      } finally {
        setLoading(false)
      }
    }

    fetchSafaris()
  }, [toast])

  useEffect(() => {
    // Count active filters
    let count = 0
    if (searchQuery) count++
    if (locationFilter !== "all") count++
    if (priceFilter !== "all") count++
    if (durationFilter !== "all") count++
    setActiveFilters(count)
  }, [searchQuery, locationFilter, priceFilter, durationFilter])

  const filteredSafaris = safaris.filter((safari) => {
    // Apply search filter
    const matchesSearch =
      safari.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      safari.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      safari.location.toLowerCase().includes(searchQuery.toLowerCase())

    // Apply location filter
    const matchesLocation = locationFilter === "all" || safari.location === locationFilter

    // Apply price filter
    let matchesPrice = true
    if (priceFilter === "under-200") {
      matchesPrice = safari.priceUSD < 200
    } else if (priceFilter === "200-300") {
      matchesPrice = safari.priceUSD >= 200 && safari.priceUSD <= 300
    } else if (priceFilter === "300-400") {
      matchesPrice = safari.priceUSD > 300 && safari.priceUSD <= 400
    } else if (priceFilter === "over-400") {
      matchesPrice = safari.priceUSD > 400
    }

    // Apply duration filter
    let matchesDuration = true
    if (durationFilter === "1-2") {
      matchesDuration = safari.duration >= 1 && safari.duration <= 2
    } else if (durationFilter === "3-5") {
      matchesDuration = safari.duration >= 3 && safari.duration <= 5
    } else if (durationFilter === "6-plus") {
      matchesDuration = safari.duration >= 6
    }

    return matchesSearch && matchesLocation && matchesPrice && matchesDuration
  })

  const resetFilters = () => {
    setSearchQuery("")
    setLocationFilter("all")
    setPriceFilter("all")
    setDurationFilter("all")
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
        <Image
          src="/placeholder.svg?height=1080&width=1920"
          alt="Kenya Safaris"
          fill
          className="object-cover opacity-70"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Explore Kenya's Safaris</h1>
          <p className="text-xl md:text-2xl text-center max-w-3xl">
            Embark on an unforgettable journey through Kenya's most spectacular wildlife reserves
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
                placeholder="Search safaris by name or location..."
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
                                variant={priceFilter === "under-200" ? "default" : "outline"}
                                className="justify-start"
                                onClick={() => setPriceFilter("under-200")}
                              >
                                Under $200
                              </Button>
                              <Button
                                variant={priceFilter === "200-300" ? "default" : "outline"}
                                className="justify-start"
                                onClick={() => setPriceFilter("200-300")}
                              >
                                $200 - $300
                              </Button>
                              <Button
                                variant={priceFilter === "300-400" ? "default" : "outline"}
                                className="justify-start"
                                onClick={() => setPriceFilter("300-400")}
                              >
                                $300 - $400
                              </Button>
                              <Button
                                variant={priceFilter === "over-400" ? "default" : "outline"}
                                className="justify-start"
                                onClick={() => setPriceFilter("over-400")}
                              >
                                Over $400
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="duration">
                        <AccordionTrigger>Duration</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pt-2">
                            <div className="grid grid-cols-1 gap-2">
                              <Button
                                variant={durationFilter === "all" ? "default" : "outline"}
                                className="justify-start"
                                onClick={() => setDurationFilter("all")}
                              >
                                All Durations
                              </Button>
                              <Button
                                variant={durationFilter === "1-2" ? "default" : "outline"}
                                className="justify-start"
                                onClick={() => setDurationFilter("1-2")}
                              >
                                1-2 Days
                              </Button>
                              <Button
                                variant={durationFilter === "3-5" ? "default" : "outline"}
                                className="justify-start"
                                onClick={() => setDurationFilter("3-5")}
                              >
                                3-5 Days
                              </Button>
                              <Button
                                variant={durationFilter === "6-plus" ? "default" : "outline"}
                                className="justify-start"
                                onClick={() => setDurationFilter("6-plus")}
                              >
                                6+ Days
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

              <Select value={durationFilter} onValueChange={setDurationFilter} className="hidden md:flex">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Durations</SelectItem>
                  <SelectItem value="1-2">1-2 Days</SelectItem>
                  <SelectItem value="3-5">3-5 Days</SelectItem>
                  <SelectItem value="6-plus">6+ Days</SelectItem>
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
              {durationFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Duration: {durationFilter.replace("-", "-") + (durationFilter === "6-plus" ? "+ Days" : " Days")}
                  <button onClick={() => setDurationFilter("all")}>
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
            {filteredSafaris.length} {filteredSafaris.length === 1 ? "Safari" : "Safaris"} Found
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
                <SelectItem value="duration-short">Duration: Shortest</SelectItem>
                <SelectItem value="duration-long">Duration: Longest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredSafaris.length === 0 ? (
          <div className="bg-background rounded-lg border p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No safaris found</h3>
            <p className="text-muted-foreground mb-6">We couldn't find any safaris matching your current filters.</p>
            <Button onClick={resetFilters}>Reset All Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSafaris.map((safari) => (
              <Link key={safari.id} href={`/safaris/${safari.id}`} className="group">
                <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg">
                  <div className="relative">
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={safari.image_url || safari.image || "/placeholder.svg"}
                        alt={safari.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    {safari.featured && <Badge className="absolute top-4 right-4 bg-primary">Featured</Badge>}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                      <h3 className="text-xl font-bold mb-1 group-hover:text-primary-foreground transition-colors">
                        {safari.name}
                      </h3>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-1 text-primary-foreground" />
                        {safari.location}
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-bold text-lg flex items-center">
                          <DollarSign className="h-4 w-4" />
                          {safari.priceUSD}
                        </p>
                        <p className="text-xs text-muted-foreground">KES {safari.priceKES.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center">
                        <div className="flex items-center bg-primary/10 text-primary rounded-full px-2 py-1">
                          <Star className="h-3 w-3 fill-primary mr-1" />
                          <span className="text-xs font-medium">4.9</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-muted-foreground line-clamp-3 mb-4">{safari.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>
                            {safari.duration} {safari.duration === 1 ? "day" : "days"}
                          </span>
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

        {filteredSafaris.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Button variant="outline" size="lg" className="gap-2">
              Load More Safaris
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Safari Packages Section */}
      <div className="bg-muted py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Safari Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background rounded-lg overflow-hidden shadow-md">
              <div className="relative h-48">
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  alt="Big Five Safari"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Big Five Safari</h3>
                <p className="text-muted-foreground mb-4">
                  Spot the Big Five (lion, leopard, elephant, buffalo, and rhino) in Kenya's premier wildlife reserves.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/safaris?type=big-five">
                    Explore Package
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="bg-background rounded-lg overflow-hidden shadow-md">
              <div className="relative h-48">
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  alt="Migration Safari"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Great Migration Safari</h3>
                <p className="text-muted-foreground mb-4">
                  Witness the spectacular wildebeest migration, one of nature's most impressive wildlife spectacles.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/safaris?type=migration">
                    Discover Migration
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="bg-background rounded-lg overflow-hidden shadow-md">
              <div className="relative h-48">
                <Image src="/placeholder.svg?height=400&width=600" alt="Luxury Safari" fill className="object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Luxury Safari Experience</h3>
                <p className="text-muted-foreground mb-4">
                  Indulge in premium accommodations and exclusive wildlife viewing for the ultimate safari experience.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/safaris?type=luxury">
                    Explore Luxury
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Safari Guide Section */}
      <div className="container py-16">
        <div className="bg-background border rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Safari Guide for Kenya</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="bg-primary/10 p-3 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold mb-1">Best Time to Visit</h3>
                <p className="text-muted-foreground">
                  The best time for safaris in Kenya is during the dry seasons: January to March and July to October,
                  when wildlife is easier to spot around water sources.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 p-3 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold mb-1">What to Pack</h3>
                <p className="text-muted-foreground">
                  Bring neutral-colored clothing, a hat, sunscreen, binoculars, a good camera, and comfortable walking
                  shoes for your safari adventure.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 p-3 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold mb-1">Safari Etiquette</h3>
                <p className="text-muted-foreground">
                  Always follow your guide's instructions, stay in your vehicle unless told otherwise, and maintain a
                  respectful distance from wildlife.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 p-3 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold mb-1">Safari Costs</h3>
                <p className="text-muted-foreground">
                  Safari costs vary widely based on accommodation level, duration, and season. Budget for park fees,
                  transportation, and optional activities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

