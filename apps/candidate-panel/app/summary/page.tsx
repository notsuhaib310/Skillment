"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import ExamSummary from "@/components/exam-summary"

export default function SummaryPage() {
  const router = useRouter()
  const [examResults, setExamResults] = useState(null)

  useEffect(() => {
    // Check if user has completed the exam
    const storedResults = sessionStorage.getItem("examResults")

    if (!storedResults) {
      router.push("/login")
      return
    }

    setExamResults(JSON.parse(storedResults))
  }, [router])

  const handleSummaryComplete = () => {
    router.push("/thank-you")
  }

  if (!examResults) {
    return (
      <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return <ExamSummary results={examResults} onComplete={handleSummaryComplete} />
}
