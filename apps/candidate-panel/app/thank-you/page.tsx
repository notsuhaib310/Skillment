"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ThankYou from "@/components/thank-you"

export default function ThankYouPage() {
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    // Check if user has completed the exam
    const examResults = sessionStorage.getItem("examResults")

    if (!examResults) {
      router.push("/login")
      return
    }

    setHasAccess(true)

    // Clear all session data after showing thank you
    const clearData = setTimeout(() => {
      sessionStorage.clear()
    }, 5000) // Clear after 5 seconds

    return () => clearTimeout(clearData)
  }, [router])

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return <ThankYou />
}
