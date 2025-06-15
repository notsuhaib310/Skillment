"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to login page on initial load
    router.push("/login")
  }, [router])

  return (
    <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center">
      <div className="text-white text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-white font-bold text-2xl">S</span>
        </div>
        <p className="text-gray-400">Redirecting to assessment platform...</p>
      </div>
    </div>
  )
}
