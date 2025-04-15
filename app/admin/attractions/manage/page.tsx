"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Edit, Trash2, Plus, Search, ArrowUpDown, Loader2, LayoutDashboard, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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

interface Attraction {
  id: string
  name: string
  location: string
  category: string
  priceUSD: number
  priceKES: number
  featured: boolean
}

export default function ManageAttractionsPage() {
  const [attractions, setAttractions] = useState<Attraction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof Attraction>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchAttractions()
  }, [])

  const fetchAttractions = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/attractions")

      if (!response.ok) {
        throw new Error("Failed to fetch attractions")
      }

      const data = await response.json()
      setAttractions(data)
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

  const handleSort = (field: keyof Attraction) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/attractions?id=${deleteId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete attraction")
      }

      toast({
        title: "Attraction deleted",
        description: "The attraction has been successfully deleted.",
      })

      // Refresh the attractions list
      fetchAttractions()
    } catch (error) {
      console.error("Error deleting attraction:", error)
      toast({
        title: "Error",
        description: "Failed to delete attraction. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
      setDeleteDialogOpen(false)
    }
  }

  // Filter attractions based on search term
  const filteredAttractions = attractions.filter(
    (attraction) =>
      attraction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attraction.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attraction.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Sort attractions
  const sortedAttractions = [...filteredAttractions].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }

    if (typeof aValue === "boolean" && typeof bValue === "boolean") {
      return sortDirection === "asc" ? (aValue ? 1 : 0) - (bValue ? 1 : 0) : (bValue ? 1 : 0) - (aValue ? 1 : 0)
    }

    return 0
  })

  return (
    <div className="container py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Manage Attractions</h1>
          <div className="flex gap-2">
            <Button onClick={() => router.push("/admin")} variant="outline">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button onClick={() => router.push("/admin/attractions")} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
            <Button onClick={() => router.push("/admin/bookings")}>
              <Users className="h-4 w-4 mr-2" />
              Manage Bookings
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Admin Navigation</CardTitle>
            <CardDescription>Quick access to admin sections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center"
                onClick={() => router.push("/admin")}
              >
                <LayoutDashboard className="h-6 w-6 mb-2" />
                Dashboard
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center"
                onClick={() => router.push("/admin/attractions")}
              >
                <Plus className="h-6 w-6 mb-2" />
                Add Attraction
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center"
                onClick={() => router.push("/admin/bookings")}
              >
                <Users className="h-6 w-6 mb-2" />
                Bookings
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Attractions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-6">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search attractions..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={fetchAttractions}>
                Refresh
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : sortedAttractions.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-lg border">
                <p className="text-muted-foreground mb-4">No attractions found.</p>
                <Button onClick={() => router.push("/admin/attractions")}>Add Attraction</Button>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                        <div className="flex items-center gap-1">
                          Name
                          {sortField === "name" && <ArrowUpDown className="h-4 w-4" />}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("location")}>
                        <div className="flex items-center gap-1">
                          Location
                          {sortField === "location" && <ArrowUpDown className="h-4 w-4" />}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("category")}>
                        <div className="flex items-center gap-1">
                          Category
                          {sortField === "category" && <ArrowUpDown className="h-4 w-4" />}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer text-right" onClick={() => handleSort("priceUSD")}>
                        <div className="flex items-center gap-1 justify-end">
                          Price
                          {sortField === "priceUSD" && <ArrowUpDown className="h-4 w-4" />}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("featured")}>
                        <div className="flex items-center gap-1">
                          Featured
                          {sortField === "featured" && <ArrowUpDown className="h-4 w-4" />}
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedAttractions.map((attraction) => (
                      <TableRow key={attraction.id}>
                        <TableCell className="font-medium">{attraction.name}</TableCell>
                        <TableCell>{attraction.location}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{attraction.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div>
                            <p>${attraction.priceUSD}</p>
                            <p className="text-xs text-muted-foreground">KES {attraction.priceKES.toLocaleString()}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {attraction.featured ? (
                            <Badge>Featured</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => router.push(`/admin/attractions/edit/${attraction.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Dialog
                              open={deleteDialogOpen && deleteId === attraction.id}
                              onOpenChange={(open) => {
                                setDeleteDialogOpen(open)
                                if (!open) setDeleteId(null)
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() => {
                                    setDeleteId(attraction.id)
                                    setDeleteDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Confirm Deletion</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete "{attraction.name}"? This action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setDeleteDialogOpen(false)
                                      setDeleteId(null)
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                                    {isDeleting ? "Deleting..." : "Delete"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

