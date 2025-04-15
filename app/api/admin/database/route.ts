import { NextResponse } from "next/server"
import { getCurrentAdminUser } from "@/lib/admin-auth"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const user = await getCurrentAdminUser()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get database information
    const dbInfoResult = (await query("SELECT VERSION() as version")) as any[]
    const version = dbInfoResult[0]?.version || "Unknown"

    // Get uptime
    const uptimeResult = (await query("SHOW STATUS LIKE 'Uptime'")) as any[]
    const uptimeSeconds = Number.parseInt(uptimeResult[0]?.Value || "0")

    // Convert seconds to days, hours, minutes
    const days = Math.floor(uptimeSeconds / 86400)
    const hours = Math.floor((uptimeSeconds % 86400) / 3600)
    const minutes = Math.floor((uptimeSeconds % 3600) / 60)

    const uptime = `${days} days, ${hours} hours, ${minutes} minutes`

    // Get table information
    const tables = []

    // Get list of tables
    const tablesResult = (await query("SHOW TABLES")) as any[]

    for (const row of tablesResult) {
      const tableName = Object.values(row)[0] as string

      // Get row count
      const rowCountResult = (await query(`SELECT COUNT(*) as count FROM ${tableName}`)) as any[]
      const rowCount = rowCountResult[0]?.count || 0

      // Get table size
      const tableSizeResult = (await query(
        `
        SELECT 
          ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
        FROM 
          information_schema.TABLES
        WHERE 
          table_schema = DATABASE() AND table_name = ?
      `,
        [tableName],
      )) as any[]

      const sizeMB = tableSizeResult[0]?.size_mb || 0

      // Get last update time
      const updateTimeResult = (await query(
        `
        SELECT 
          UPDATE_TIME
        FROM 
          information_schema.TABLES
        WHERE 
          table_schema = DATABASE() AND table_name = ?
      `,
        [tableName],
      )) as any[]

      const updateTime = updateTimeResult[0]?.UPDATE_TIME || new Date().toISOString()

      tables.push({
        name: tableName,
        rows: rowCount,
        size: `${sizeMB} MB`,
        lastUpdated: updateTime,
      })
    }

    return NextResponse.json({
      connection: true,
      version,
      uptime,
      tables,
    })
  } catch (error) {
    console.error("Database status error:", error)
    return NextResponse.json(
      {
        connection: false,
        version: "Unknown",
        uptime: "Unknown",
        tables: [],
        error: "An error occurred while fetching database status",
      },
      { status: 500 },
    )
  }
}

