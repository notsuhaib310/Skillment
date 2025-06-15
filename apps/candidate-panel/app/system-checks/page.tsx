"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import SystemChecks from "@/components/system-checks"

export default function SystemChecksPage() {
  const router = useRouter()
  const [candidateData, setCandidateData] = useState(null)

  useEffect(() => {
    // Check if user is authenticated
    const storedData = sessionStorage.getItem("candidateData")
    if (!storedData) {
      router.push("/login")
      return
    }
    setCandidateData(JSON.parse(storedData))
  }, [router])

  const handleSystemChecksComplete = (status: any) => {
    // Store system status for next route
    sessionStorage.setItem("systemStatus", JSON.stringify(status))
    router.push("/guidelines")
  }

  if (!candidateData) {
    return (
      <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return <SystemChecks onComplete={handleSystemChecksComplete} />
}
