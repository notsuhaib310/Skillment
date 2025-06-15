"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import AssessmentGuidelines from "@/components/assessment-guidelines"

export default function GuidelinesPage() {
  const router = useRouter()
  const [candidateData, setCandidateData] = useState(null)
  const [systemStatus, setSystemStatus] = useState(null)

  useEffect(() => {
    // Check if user has completed previous steps
    const storedCandidateData = sessionStorage.getItem("candidateData")
    const storedSystemStatus = sessionStorage.getItem("systemStatus")

    if (!storedCandidateData || !storedSystemStatus) {
      router.push("/login")
      return
    }

    setCandidateData(JSON.parse(storedCandidateData))
    setSystemStatus(JSON.parse(storedSystemStatus))
  }, [router])

  const handleGuidelinesAccepted = () => {
    router.push("/exam")
  }

  if (!candidateData || !systemStatus) {
    return (
      <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return <AssessmentGuidelines onAccept={handleGuidelinesAccepted} />
}
