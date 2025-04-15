"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Plus, Search, Edit, Trash2, Eye, ArrowUpDown, Filter, Download, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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

interface Attraction {
  id: string
  name: string
  location: string
  description: string
  image: string
  priceUSD: number
  priceKES: number
  featured: boolean
  created_at: string
}

export default function AdminAttractionsPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [attractions, setAttractions] = useState<Attraction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    const fetchAttractions = async () => {
      try {
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

    fetchAttractions()
  }, [toast])

  const handleDeleteClick = (id: string) => {
    setDeleteId(id)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/attractions?id=${deleteId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete attraction")
      }

      // Remove the deleted attraction from the state
      setAttractions(attractions.filter((attraction) => attraction.id !== deleteId))

      toast({
        title: "Attraction Deleted",
        description: "The attraction has been successfully deleted.",
      })
    } catch (error) {
      console.error("Error deleting attraction:", error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete attraction. Please try again.",
        variant: "destructive",
      })
    } finally {
      setShowDeleteDialog(false)
      setDeleteId(null)
    }
  }

  const filteredAttractions = attractions.filter(
    (attraction) =>
      attraction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attraction.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Manage Attractions</h1>
            <p className="text-muted-foreground">Add, edit, and delete attractions</p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/admin/attractions/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Attraction
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle>All Attractions</CardTitle>
                <CardDescription>{attractions.length} attractions found</CardDescription>
              </div>
              <div className="w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search attractions..."
                    className="pl-8 w-full md:w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      Name
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Price (USD)</TableHead>
                  <TableHead>Price (KES)</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttractions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {searchQuery ? "No attractions found matching your search" : "No attractions found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAttractions.map((attraction) => (
                    <TableRow key={attraction.id}>
                      <TableCell>
                        <div className="relative h-10 w-10 rounded-md overflow-hidden">
                          <Image
                            src={attraction.image || "/placeholder.svg"}
                            alt={attraction.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{attraction.name}</TableCell>
                      <TableCell>{attraction.location}</TableCell>
                      <TableCell>${attraction.priceUSD}</TableCell>
                      <TableCell>KES {attraction.priceKES.toLocaleString()}</TableCell>
                      <TableCell>
                        {attraction.featured ? (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                            Featured
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                            Standard
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/attractions/${attraction.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/attractions/${attraction.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(attraction.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

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
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

