"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ProctoredExam from "@/components/proctored-exam"
import CodingExam from "@/components/coding-exam"
import MCQExam from "@/components/mcq-exam"

export default function ExamPage() {
  const router = useRouter()
  const [candidateData, setCandidateData] = useState<any>(null)
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const candidateDataStr = sessionStorage.getItem("candidateData")
    const selectedAssessmentStr = sessionStorage.getItem("selectedAssessment")
    
    if (!candidateDataStr) {
      router.push("/login")
      return
    }

    if (!selectedAssessmentStr) {
      router.push("/dashboard")
      return
    }

    try {
      const parsedCandidateData = JSON.parse(candidateDataStr)
      const parsedAssessment = JSON.parse(selectedAssessmentStr)
      
      setCandidateData(parsedCandidateData)
      setSelectedAssessment(parsedAssessment)
    } catch (error) {
      console.error("Error parsing data:", error)
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

  const handleBackToDashboard = () => {
    router.push("/dashboard")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#181c24] via-[#23272f] to-[#0a0b0d] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff4d00] mx-auto"></div>
          <p className="text-gray-300">Loading exam...</p>
        </div>
      </div>
    )
  }

  if (!candidateData || !selectedAssessment) {
    return null
  }

  const questions = selectedAssessment.questions || [];
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#181c24] via-[#23272f] to-[#0a0b0d] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-white text-xl">No questions found for this assessment.</div>
          <button 
            onClick={handleBackToDashboard}
            className="px-6 py-3 bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] text-white rounded-xl hover:from-[#e63900] hover:to-[#ff5722] transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Choose the appropriate exam component based on assessment type
  const assessmentType = selectedAssessment.type?.toLowerCase()
  
  if (assessmentType === "coding") {
    return (
      <CodingExam 
        candidateData={candidateData} 
        assessment={selectedAssessment}
        onComplete={handleExamComplete}
      />
    )
  }

  if (assessmentType === "mcq") {
    return (
      <MCQExam 
        assessment={selectedAssessment}
        onComplete={handleExamComplete} 
        onBack={handleBackToDashboard}
      />
    )
  }

  // For hybrid or proctored exams, use the proctored exam component
  return (
    <ProctoredExam 
      candidateData={{...candidateData, assignedAssessment: selectedAssessment}} 
      systemStatus={{}}
      onComplete={handleExamComplete}
    />
  )
}
