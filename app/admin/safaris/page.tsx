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

interface Safari {
  id: string
  name: string
  location: string
  description: string
  image: string
  priceUSD: number
  priceKES: number
  featured: boolean
  duration: number
}

export default function AdminSafarisPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [safaris, setSafaris] = useState<Safari[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    const fetchSafaris = async () => {
      try {
        const response = await fetch("/api/safaris")

        if (!response.ok) {
          throw new Error("Failed to fetch safaris")
        }

        const data = await response.json()
        setSafaris(data)
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
            description: "Experience the incredible wildlife of the Maasai Mara National Reserve.",
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
            description: "Enjoy breathtaking views of Mount Kilimanjaro while spotting elephants.",
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
            description: "Explore Kenya's largest national park, known for its red elephants.",
            image: "/placeholder.svg?height=400&width=600",
            priceUSD: 420,
            priceKES: 54600,
            featured: true,
            duration: 4,
          },
        ]

        setSafaris(sampleSafaris)
      } finally {
        setLoading(false)
      }
    }

    fetchSafaris()
  }, [toast])

  const handleDeleteClick = (id: string) => {
    setDeleteId(id)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/safaris?id=${deleteId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete safari")
      }

      // Remove the deleted safari from the state
      setSafaris(safaris.filter((safari) => safari.id !== deleteId))

      toast({
        title: "Safari Deleted",
        description: "The safari has been successfully deleted.",
      })
    } catch (error) {
      console.error("Error deleting safari:", error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete safari. Please try again.",
        variant: "destructive",
      })
    } finally {
      setShowDeleteDialog(false)
      setDeleteId(null)
    }
  }

  const filteredSafaris = safaris.filter(
    (safari) =>
      safari.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      safari.location.toLowerCase().includes(searchQuery.toLowerCase()),
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
            <h1 className="text-3xl font-bold">Manage Safaris</h1>
            <p className="text-muted-foreground">Add, edit, and delete safaris</p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/admin/safaris/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Safari
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
                <CardTitle>All Safaris</CardTitle>
                <CardDescription>{safaris.length} safaris found</CardDescription>
              </div>
              <div className="w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search safaris..."
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
                  <TableHead>Duration</TableHead>
                  <TableHead>Price (USD)</TableHead>
                  <TableHead>Price (KES)</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSafaris.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      {searchQuery ? "No safaris found matching your search" : "No safaris found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSafaris.map((safari) => (
                    <TableRow key={safari.id}>
                      <TableCell>
                        <div className="relative h-10 w-10 rounded-md overflow-hidden">
                          <Image
                            src={safari.image || "/placeholder.svg"}
                            alt={safari.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{safari.name}</TableCell>
                      <TableCell>{safari.location}</TableCell>
                      <TableCell>{safari.duration} days</TableCell>
                      <TableCell>${safari.priceUSD}</TableCell>
                      <TableCell>KES {safari.priceKES.toLocaleString()}</TableCell>
                      <TableCell>
                        {safari.featured ? (
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
                            <Link href={`/safaris/${safari.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/safaris/${safari.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(safari.id)}>
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
                This action cannot be undone. This will permanently delete the safari and remove it from our servers.
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

