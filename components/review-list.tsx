"use client"

import { useState, useEffect } from "react"
import { Star, User } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Review {
  id: string
  user_id: string
  first_name: string
  last_name: string
  rating: number
  comment: string
  created_at: string
}

interface ReviewListProps {
  attractionId: string
  refreshTrigger: number
}

export function ReviewList({ attractionId, refreshTrigger }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/reviews?attractionId=${attractionId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch reviews")
        }

        const data = await response.json()
        setReviews(data)
      } catch (error) {
        console.error("Error fetching reviews:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [attractionId, refreshTrigger])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-primary/10 h-10 w-10 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">
                {review.first_name} {review.last_name}
              </p>
              <p className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${star <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
              />
            ))}
          </div>

          {review.comment && <p className="text-muted-foreground">{review.comment}</p>}
        </div>
      ))}
    </div>
  )
}

