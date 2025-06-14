import { NextResponse } from "next/server"
import { testConnection } from "@/lib/db"

export async function POST() {
  try {
    const isConnected = await testConnection()

    if (isConnected) {
      return NextResponse.json({ success: true, message: "Database connection successful" })
    } else {
      return NextResponse.json({ success: false, error: "Database connection failed" })
    }
  } catch (error: any) {
    console.error("Connection test error:", error)
    return NextResponse.json({
      success: false,
      error: error.message || "Unknown error occurred",
    })
  }
}
