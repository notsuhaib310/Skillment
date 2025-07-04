"use client"

import { useState } from "react"
import CandidateLogin from "@/components/candidate-login"
import AssessmentGuidelines from "@/components/assessment-guidelines"
import SystemChecks from "@/components/system-checks"
import CodingExam from "@/components/coding-exam"
import MCQExam from "@/components/mcq-exam"
import AssessmentSummary from "@/components/assessment-summary"
import ThankYou from "@/components/thank-you"

export default function CandidatePanel() {
  const [currentStep, setCurrentStep] = useState<'login' | 'guidelines' | 'system-checks' | 'exam' | 'summary' | 'thank-you'>('login')
  const [candidateData, setCandidateData] = useState<any>(null)
  const [assessmentData, setAssessmentData] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<string, any>>({})

  const handleLoginSuccess = (data: any) => {
    setCandidateData(data)
    
    // Fetch candidate's assessment
    if (data.candidate?.assessment) {
      setAssessmentData(data.candidate.assessment)
      setCurrentStep('guidelines')
    } else {
      // Fetch assessment data from API
      fetchCandidateAssessment(data.candidate?.id || 'demo')
    }
  }

  const fetchCandidateAssessment = async (candidateId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/candidates/assessments?candidateId=${candidateId}`)
      const data = await response.json()
      
      if (data && data.length > 0) {
        setAssessmentData(data[0].assessment)
        setCurrentStep('guidelines')
      } else {
        alert('No assessment found for this candidate')
      }
    } catch (error) {
      console.error('Error fetching assessment:', error)
      alert('Failed to load assessment')
    }
  }

  const handleGuidelinesAccept = () => {
    if (assessmentData?.enableProctoring || assessmentData?.webcamMonitoring) {
      setCurrentStep('system-checks')
    } else {
      setCurrentStep('exam')
    }
  }

  const handleSystemChecksComplete = () => {
    setCurrentStep('exam')
  }

  const handleExamComplete = (examAnswers: Record<string, any>) => {
    setAnswers(examAnswers)
    setCurrentStep('summary')
  }

  const handleSubmitAssessment = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/candidates/submit-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId: candidateData?.candidateId || candidateData?.candidate?.id,
          answers: answers,
          timeSpent: Date.now() - (candidateData?.startTime || Date.now()) // Track time
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        setCurrentStep('thank-you')
      } else {
        alert('Failed to submit assessment: ' + result.message)
      }
    } catch (error) {
      console.error('Error submitting assessment:', error)
      alert('Failed to submit assessment')
    }
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'login':
        return <CandidateLogin onSuccess={handleLoginSuccess} />
      
      case 'guidelines':
        return (
          <AssessmentGuidelines
            assessment={assessmentData}
            onAccept={handleGuidelinesAccept}
            onBack={() => setCurrentStep('login')}
          />
        )
      
      case 'system-checks':
        return (
          <SystemChecks
            assessment={assessmentData}
            onComplete={handleSystemChecksComplete}
            onBack={() => setCurrentStep('guidelines')}
          />
        )
      
      case 'exam':
        return assessmentData?.type === 'coding' ? (
          <CodingExam
            assessment={assessmentData}
            onComplete={handleExamComplete}
            onBack={() => setCurrentStep(assessmentData?.enableProctoring ? 'system-checks' : 'guidelines')}
          />
        ) : (
          <MCQExam
            assessment={assessmentData}
            onComplete={handleExamComplete}
            onBack={() => setCurrentStep(assessmentData?.enableProctoring ? 'system-checks' : 'guidelines')}
          />
        )
      
      case 'summary':
        return (
          <AssessmentSummary
            assessment={assessmentData}
            answers={answers}
            onSubmit={handleSubmitAssessment}
            onBack={() => setCurrentStep('exam')}
          />
        )
      
      case 'thank-you':
        return <ThankYou />
      
      default:
        return <CandidateLogin onSuccess={handleLoginSuccess} />
    }
  }

  return (
    <div className="min-h-screen">
      {renderCurrentStep()}
    </div>
  )
}
