"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DollarSign, Calendar, Users, Clock, Check, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface Attraction {
  id: string
  name: string
  location: string
  priceUSD: number
  priceKES: number
  category: string
}

export default function PricesPage() {
  const [attractions, setAttractions] = useState<Attraction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        const response = await fetch("/api/attractions")

        if (!response.ok) {
          throw new Error("Failed to fetch attractions")
        }

        const data = await response.json()
        setAttractions(data)
      } catch (err) {
        setError("Error loading price information. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAttractions()
  }, [])

  // Group attractions by category
  const attractionsByCategory = attractions.reduce(
    (acc, attraction) => {
      const category = attraction.category || "Uncategorized"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(attraction)
      return acc
    },
    {} as Record<string, Attraction[]>,
  )

  return (
    <div className="min-h-screen">
      <div className="bg-muted/30 py-12">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Pricing & Packages</h1>
            <p className="text-muted-foreground text-lg mb-6">
              Explore our transparent pricing for all attractions and safari packages. Find the perfect adventure that
              fits your budget.
            </p>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <Tabs defaultValue="attractions" className="max-w-5xl mx-auto">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="attractions">Attractions</TabsTrigger>
            <TabsTrigger value="safaris">Safari Packages</TabsTrigger>
            <TabsTrigger value="special">Special Offers</TabsTrigger>
          </TabsList>

          <TabsContent value="attractions">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-500 p-4 rounded-lg">{error}</div>
            ) : (
              <div className="space-y-10">
                <div className="bg-muted/30 p-6 rounded-lg border">
                  <div className="flex items-start gap-3 mb-4">
                    <Info className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium">Price Information</h3>
                      <p className="text-sm text-muted-foreground">
                        All prices are listed in both USD and KES. Prices may vary based on season and group size.
                        Children aged 6-12 receive a 30% discount, and children under 5 enter for free when accompanied
                        by a paying adult.
                      </p>
                    </div>
                  </div>
                </div>

                {Object.entries(attractionsByCategory).map(([category, categoryAttractions]) => (
                  <div key={category}>
                    <h2 className="text-2xl font-bold mb-4">{category}</h2>
                    <Card>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Attraction</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead className="text-right">Price (USD)</TableHead>
                              <TableHead className="text-right">Price (KES)</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {categoryAttractions.map((attraction) => (
                              <TableRow key={attraction.id}>
                                <TableCell className="font-medium">{attraction.name}</TableCell>
                                <TableCell>{attraction.location}</TableCell>
                                <TableCell className="text-right">${attraction.priceUSD}</TableCell>
                                <TableCell className="text-right">KES {attraction.priceKES.toLocaleString()}</TableCell>
                                <TableCell className="text-right">
                                  <Link href={`/attractions/${attraction.id}`}>
                                    <Button size="sm">View Details</Button>
                                  </Link>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="safaris">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {safariPackages.map((safari, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="bg-muted h-40 flex items-center justify-center">
                    <DollarSign className="h-16 w-16 text-muted-foreground/40" />
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{safari.name}</CardTitle>
                        <CardDescription>{safari.description}</CardDescription>
                      </div>
                      {safari.featured && <Badge>Featured</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{safari.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>Max: {safari.maxPeople}</span>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Adult Price</span>
                          <div className="text-right">
                            <p className="font-bold">${safari.price}</p>
                            <p className="text-xs text-muted-foreground">KES {safari.priceKES.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span>Child (6-12)</span>
                          <div className="text-right">
                            <p className="font-bold">${Math.round(safari.price * 0.7)}</p>
                            <p className="text-xs text-muted-foreground">
                              KES {Math.round(safari.priceKES * 0.7).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button className="w-full">Book Now</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="special">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {specialOffers.map((offer, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="bg-primary text-primary-foreground">
                    <CardTitle>{offer.name}</CardTitle>
                    <CardDescription className="text-primary-foreground/80">{offer.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Limited Time Offer</p>
                          <p className="text-sm text-muted-foreground">Valid until {offer.validUntil}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Discount</p>
                          <p className="text-sm text-muted-foreground">{offer.discount}</p>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <p className="font-medium">What's Included:</p>
                        <ul className="space-y-1">
                          {offer.includes.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-primary mt-0.5" />
                              <span className="text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-muted-foreground">From</p>
                          <p className="text-2xl font-bold text-primary">${offer.price}</p>
                          <p className="text-xs text-muted-foreground">KES {offer.priceKES.toLocaleString()}</p>
                        </div>
                        <Button>Book Offer</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="max-w-3xl mx-auto mt-16 bg-muted/30 p-6 rounded-lg border">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Do you offer group discounts?</h3>
              <p className="text-muted-foreground">
                Yes, we offer discounts for groups of 8 or more people. Please contact us for custom pricing.
              </p>
            </div>
            <Separator />
            <div>
              <h3 className="font-medium mb-2">What is your cancellation policy?</h3>
              <p className="text-muted-foreground">
                We offer free cancellation up to 24 hours before your scheduled tour. Cancellations made less than 24
                hours in advance are subject to a 50% fee.
              </p>
            </div>
            <Separator />
            <div>
              <h3 className="font-medium mb-2">Are there any additional fees not included in the price?</h3>
              <p className="text-muted-foreground">
                Our prices include all park entrance fees and transportation. Additional costs may include personal
                expenses, tips, and optional activities.
              </p>
            </div>
            <Separator />
            <div>
              <h3 className="font-medium mb-2">Can I pay in other currencies?</h3>
              <p className="text-muted-foreground">
                We accept payments in USD, KES, EUR, and GBP. The exchange rate will be calculated at the time of
                payment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Sample data for safari packages
const safariPackages = [
  {
    name: "Classic Kenya Safari",
    description: "Experience the best of Kenya's wildlife in Maasai Mara, Lake Nakuru, and Amboseli.",
    duration: "7 Days",
    maxPeople: 8,
    price: 1299,
    priceKES: 168870,
    featured: true,
  },
  {
    name: "Big Five Adventure",
    description: "Track the Big Five (lion, leopard, elephant, buffalo, and rhino) in their natural habitat.",
    duration: "5 Days",
    maxPeople: 6,
    price: 999,
    priceKES: 129870,
    featured: false,
  },
  {
    name: "Coastal Escape",
    description: "Relax on the beautiful beaches of Mombasa and explore marine life.",
    duration: "4 Days",
    maxPeople: 10,
    price: 799,
    priceKES: 103870,
    featured: false,
  },
]

// Sample data for special offers
const specialOffers = [
  {
    name: "Family Safari Package",
    description: "Perfect for families with children. Explore Kenya's wildlife together!",
    validUntil: "December 31, 2023",
    discount: "Kids under 12 stay and travel free",
    price: 2499,
    priceKES: 324870,
    includes: [
      "Accommodation for 2 adults and up to 2 children",
      "All meals and transportation",
      "Kid-friendly activities and guides",
      "5 days / 4 nights at premium lodges",
    ],
  },
  {
    name: "Honeymoon Special",
    description: "Celebrate your love with a romantic safari experience.",
    validUntil: "March 31, 2024",
    discount: "20% off regular package price + complimentary champagne",
    price: 1899,
    priceKES: 246870,
    includes: [
      "Luxury accommodation for 2",
      "Private game drives",
      "Romantic dinner under the stars",
      "Complimentary spa treatment",
      "6 days / 5 nights",
    ],
  },
]

