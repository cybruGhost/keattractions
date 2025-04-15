import mysql from "mysql2/promise"

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "savanak_ke",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Helper function to execute SQL queries
export async function query(sql: string, params: any[] = []) {
  try {
    const [results] = await pool.execute(sql, params)
    return results
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Helper function to get a single row
export async function queryRow(sql: string, params: any[] = []) {
  const results = (await query(sql, params)) as any[]
  return results[0]
}

// Helper function to get a single value
export async function queryValue(sql: string, params: any[] = []) {
  const row = await queryRow(sql, params)
  if (!row) return null
  return Object.values(row)[0]
}

