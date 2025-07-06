"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import CandidateDashboard from "@/components/candidate-dashboard"

export default function DashboardPage() {
  const router = useRouter()
  const [candidateData, setCandidateData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const data = sessionStorage.getItem("candidateData")
    if (!data) {
      router.push("/login")
      return
    }

    try {
      const parsedData = JSON.parse(data)
      setCandidateData(parsedData)
    } catch (error) {
      console.error("Error parsing candidate data:", error)
      router.push("/login")
      return
    }

    setLoading(false)
  }, [router])

  const handleStartAssessment = (assessment: any) => {
    // Store the selected assessment
    sessionStorage.setItem("selectedAssessment", JSON.stringify(assessment))
    
    // Check if assessment requires proctoring or system checks
    if (assessment.enableProctoring || assessment.webcamMonitoring || assessment.screenRecording) {
      router.push("/guidelines")
    } else {
      // Go directly to exam if no proctoring
      router.push("/exam")
    }
  }

  const handleLogout = () => {
    // Clear session data
    sessionStorage.removeItem("candidateData")
    sessionStorage.removeItem("authToken")
    sessionStorage.removeItem("selectedAssessment")
    sessionStorage.removeItem("examResults")
    
    // Redirect to login
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#181c24] via-[#23272f] to-[#0a0b0d] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff4d00] mx-auto"></div>
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!candidateData) {
    return null
  }

  return (
    <CandidateDashboard
      candidateData={candidateData}
      onStartAssessment={handleStartAssessment}
      onLogout={handleLogout}
    />
  )
} 