"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Calendar, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SearchAdventures() {
  const router = useRouter()
  const [destination, setDestination] = useState("")
  const [date, setDate] = useState("")
  const [guests, setGuests] = useState("2")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // Build the search query
    const searchParams = new URLSearchParams()

    if (destination) {
      searchParams.set("location", destination)
    }

    if (date) {
      searchParams.set("date", date)
    }

    if (guests) {
      searchParams.set("guests", guests)
    }

    // Determine where to redirect based on the search
    let redirectUrl = "/attractions"

    // If the destination contains "safari" or similar keywords, redirect to safaris
    if (destination.toLowerCase().includes("safari")) {
      redirectUrl = "/safaris"
    }

    // Redirect with search parameters
    router.push(`${redirectUrl}?${searchParams.toString()}`)
  }

  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-3xl bg-background/10 backdrop-blur-md rounded-xl p-4 md:p-6 border border-white/10"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-white text-sm mb-1 block">Destination</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-white/70" />
            <Input
              placeholder="Where to?"
              className="bg-white/20 border-0 text-white placeholder:text-white/70 pl-10"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="text-white text-sm mb-1 block">Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-white/70" />
            <Input
              type="date"
              className="bg-white/20 border-0 text-white placeholder:text-white/70 pl-10"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="text-white text-sm mb-1 block">Guests</label>
          <div className="relative">
            <Users className="absolute left-3 top-3 h-4 w-4 text-white/70" />
            <Select value={guests} onValueChange={setGuests}>
              <SelectTrigger className="bg-white/20 border-0 text-white pl-10">
                <SelectValue placeholder="How many?" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? "Guest" : "Guests"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <Button type="submit" className="w-full mt-4 bg-primary hover:bg-primary/90">
        Search Adventures
      </Button>
    </form>
  )
}

