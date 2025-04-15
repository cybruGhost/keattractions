"use client"

import { Input } from "@/components/ui/input"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, MapPin, Star, Calendar, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SearchAdventures } from "@/app/home/search"

interface Attraction {
  id: string
  name: string
  location: string
  image: string
  rating: number
  reviews: number
  priceUSD: number
  priceKES: number
  description: string
  featured: boolean
}

interface Safari {
  id: string
  name: string
  description: string
  duration: string
  maxPeople: number
  image: string
  price: number
  priceKES: number
  featured: boolean
}

export default function Home() {
  const [attractions, setAttractions] = useState<Attraction[]>([])
  const [safaris, setSafaris] = useState<Safari[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch attractions
        const attractionsResponse = await fetch("/api/attractions")
        if (!attractionsResponse.ok) {
          throw new Error("Failed to fetch attractions")
        }
        const attractionsData = await attractionsResponse.json()

        // Fetch safaris
        const safarisResponse = await fetch("/api/safaris")
        if (!safarisResponse.ok) {
          throw new Error("Failed to fetch safaris")
        }
        const safarisData = await safarisResponse.json()

        // Set state with fetched data
        setAttractions(attractionsData)
        setSafaris(
          safarisData.map((safari: any) => ({
            ...safari,
            price: safari.priceUSD,
            maxPeople: safari.max_people,
          })),
        )
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Get featured attractions (max 3)
  const popularDestinations = attractions.filter((attraction) => attraction.featured).slice(0, 3)

  // Fallback to first 3 attractions if no featured ones
  const displayedAttractions = popularDestinations.length > 0 ? popularDestinations : attractions.slice(0, 3)

  // Get featured safaris (max 3)
  const featuredSafaris = safaris.filter((safari) => safari.featured).slice(0, 3)

  // Fallback to first 3 safaris if no featured ones
  const displayedSafaris = featuredSafaris.length > 0 ? featuredSafaris : safaris.slice(0, 3)

  return (
    <div className="flex flex-col">
    {/* Hero Section */}
    <section className="relative h-[600px] flex items-center">
       {/* Background Video */}
        <video
        src="/ctavideo.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover brightness-[0.7]"
      />
        <div className="container relative z-10 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Discover the Magic of Kenya</h1>
          <p className="text-xl text-white/90 max-w-2xl mb-8">
            Experience breathtaking wildlife, stunning landscapes, and rich cultural heritage
          </p>
          <SearchAdventures />
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">Popular Destinations</h2>
            <Link href="/attractions" className="text-primary flex items-center gap-1 hover:underline">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedAttractions.map((attraction, index) => (
                <Card
                  key={attraction.id || index}
                  className="overflow-hidden group border-0 bg-background shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative h-64">
                    <Image
                      src={attraction.image || "/placeholder.svg"}
                      alt={attraction.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105 duration-500"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <div className="flex items-center gap-2 text-white mb-1">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{attraction.location}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white">{attraction.name}</h3>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {attraction.rating} ({attraction.reviews} reviews)
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-primary font-bold">${attraction.priceUSD}</span>
                        <span className="text-xs text-muted-foreground">
                          KES {attraction.priceKES.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">{attraction.description}</p>
                    <Link href={`/attractions/${attraction.id}`}>
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Safari Packages */}
      <section className="py-16">
        <div className="container">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">Safari Packages</h2>
            <Link href="/safaris" className="text-primary flex items-center gap-1 hover:underline">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {displayedSafaris.map((safari, index) => (
                <Card
                  key={safari.id || index}
                  className="flex flex-col h-full border-0 bg-background shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative h-48">
                    <Image
                      src={safari.image || "/placeholder.svg"}
                      alt={safari.name}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                    {safari.featured && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        Featured
                      </div>
                    )}
                  </div>
                  <CardContent className="flex-1 p-5">
                    <h3 className="text-xl font-bold mb-2">{safari.name}</h3>
                    <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{safari.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>Max: {safari.maxPeople}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">{safari.description}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div>
                        <span className="text-sm text-muted-foreground">From</span>
                        <p className="text-xl font-bold text-primary">${safari.price}</p>
                        <p className="text-xs text-muted-foreground">KES {safari.priceKES.toLocaleString()}</p>
                      </div>
                      <Link href={`/safaris/${safari.id}`}>
                        <Button>Book Now</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl font-bold mb-10 text-center">What Our Travelers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="p-6 border-0 bg-background shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <Image
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated with Savanak.ke</h2>
            <p className="mb-6">
              Subscribe to our newsletter for exclusive offers, travel tips, and updates on new destinations.
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <Input
                placeholder="Enter your email"
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/70"
              />
              <Button variant="secondary">Subscribe</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Sample data for testimonials (this won't be hardcoded in the final version)
const testimonials = [
  {
    name: "Sarah Johnson",
    location: "United States",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    text: "Our safari with Savanak.ke was absolutely incredible! The guides were knowledgeable, and we saw all of the Big Five. A dream come true!",
  },
  {
    name: "David Chen",
    location: "Canada",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    text: "From booking to the actual safari, everything was seamless. The accommodations were luxurious and the wildlife sightings were spectacular.",
  },
  {
    name: "Emma Williams",
    location: "United Kingdom",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 4,
    text: "Diani Beach was paradise! The Savanak.ke team arranged everything perfectly and were always available to answer questions.",
  },
]

