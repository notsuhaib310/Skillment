"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ProctoredExam from "@/components/proctored-exam"
import CodingExam from "@/components/coding-exam"

export default function ExamPage() {
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

  const handleExamComplete = (results: any) => {
    // Store exam results
    sessionStorage.setItem("examResults", JSON.stringify(results))
    router.push("/summary")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center">
        <div className="text-white">Loading exam...</div>
      </div>
    )
  }

  if (!candidateData) {
    return null
  }

  // Render different exam types based on assessment type
  if (candidateData.assessmentType === "coding") {
    return <CodingExam onComplete={handleExamComplete} candidateData={candidateData} />
  }

  // Default to MCQ exam
  return <ProctoredExam onComplete={handleExamComplete} candidateData={candidateData} />
}
