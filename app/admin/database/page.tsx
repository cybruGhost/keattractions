"use client"

import { useState, useEffect } from "react"
import { RefreshCw, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface DatabaseTable {
  name: string
  rows: number
  size: string
  lastUpdated: string
}

interface DatabaseStatus {
  connection: boolean
  version: string
  uptime: string
  tables: DatabaseTable[]
}

export default function DatabasePage() {
  const { toast } = useToast()
  const [status, setStatus] = useState<DatabaseStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDatabaseStatus = async () => {
    try {
      setRefreshing(true)

      // In a real app, you'd fetch this from an API
      const response = await fetch("/api/admin/database")

      if (!response.ok) {
        throw new Error("Failed to fetch database status")
      }

      const data = await response.json()
      setStatus(data)

      toast({
        title: "Database Status Updated",
        description: "The database status has been refreshed.",
      })
    } catch (error) {
      console.error("Error fetching database status:", error)
      toast({
        title: "Error",
        description: "Failed to fetch database status. Please try again.",
        variant: "destructive",
      })

      // Fallback to mock data if API fails
      const mockStatus: DatabaseStatus = {
        connection: true,
        version: "MySQL 8.0.28",
        uptime: "7 days, 3 hours",
        tables: [
          { name: "attractions", rows: 15, size: "1.2 MB", lastUpdated: new Date().toISOString() },
          { name: "bookings", rows: 87, size: "3.5 MB", lastUpdated: new Date().toISOString() },
          { name: "reviews", rows: 42, size: "0.8 MB", lastUpdated: new Date().toISOString() },
          { name: "safaris", rows: 8, size: "0.9 MB", lastUpdated: new Date().toISOString() },
          { name: "users", rows: 124, size: "2.1 MB", lastUpdated: new Date().toISOString() },
        ],
      }

      setStatus(mockStatus)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDatabaseStatus()
  }, [])

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
            <h1 className="text-3xl font-bold">Database Status</h1>
            <p className="text-muted-foreground">Monitor and manage your database</p>
          </div>
          <Button onClick={fetchDatabaseStatus} disabled={refreshing}>
            {refreshing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Status
              </>
            )}
          </Button>
        </div>

        {status?.connection ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="mr-2 h-4 w-4 rounded-full bg-green-500"></div>
                  <div className="font-bold text-xl">Connected</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Database Version</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-xl">{status.version}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-xl">{status.uptime}</div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>
              Unable to connect to the database. Please check your database configuration.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Database Tables</CardTitle>
            <CardDescription>Overview of all tables in the database</CardDescription>
          </CardHeader>
          <CardContent>
            <UITable>
              <TableHeader>
                <TableRow>
                  <TableHead>Table Name</TableHead>
                  <TableHead className="text-right">Rows</TableHead>
                  <TableHead className="text-right">Size</TableHead>
                  <TableHead className="text-right">Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {status?.tables.map((table) => (
                  <TableRow key={table.name}>
                    <TableCell className="font-medium">{table.name}</TableCell>
                    <TableCell className="text-right">{table.rows}</TableCell>
                    <TableCell className="text-right">{table.size}</TableCell>
                    <TableCell className="text-right">{new Date(table.lastUpdated).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </UITable>
          </CardContent>
        </Card>
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Database Migrations</CardTitle>
            <CardDescription>Run database migrations to update table structures</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/admin/database/migrate", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          migration: `
                    -- Modify the image column to support longer URLs
                    ALTER TABLE attractions MODIFY COLUMN image VARCHAR(3000);
                    
                    -- Add image_url column if it doesn't exist
                    ALTER TABLE attractions ADD COLUMN IF NOT EXISTS image_url VARCHAR(3000);
                  `,
                        }),
                      })

                      if (!response.ok) {
                        throw new Error("Failed to run migration")
                      }

                      toast({
                        title: "Migration Successful",
                        description: "Database tables have been updated successfully.",
                      })
                    } catch (error) {
                      console.error("Migration error:", error)
                      toast({
                        title: "Migration Failed",
                        description: "Failed to update database tables. Please check the logs.",
                        variant: "destructive",
                      })
                    }
                  }}
                >
                  Update Image Columns
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

