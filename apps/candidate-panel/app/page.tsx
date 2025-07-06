"use client"

import { useState } from "react"
import CandidateLogin from "@/components/candidate-login"
import AssessmentGuidelines from "@/components/assessment-guidelines"
import SystemChecks from "@/components/system-checks"
import CodingExam from "@/components/coding-exam"
import ProctoredExam from "@/components/proctored-exam"
import AssessmentSummary from "@/components/assessment-summary"
import ThankYou from "@/components/thank-you"

export default function CandidatePanel() {
  const [currentStep, setCurrentStep] = useState<'login' | 'guidelines' | 'system-checks' | 'exam' | 'summary' | 'thank-you'>('login')
  const [candidateData, setCandidateData] = useState<any>(null)
  const [assessmentData, setAssessmentData] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [submissionResult, setSubmissionResult] = useState<any>(null)

  const handleLoginSuccess = (data: any) => {
    console.log('Login success data:', data)
    setCandidateData(data)
    
    // Set assessment data from login response
    if (data.assignedAssessment) {
      console.log('Using assigned assessment from login:', data.assignedAssessment)
      setAssessmentData(data.assignedAssessment)
      setCurrentStep('guidelines')
    } else if (data.allAssignments && data.allAssignments.length > 0) {
      console.log('Using first assignment from all assignments:', data.allAssignments[0])
      setAssessmentData(data.allAssignments[0].assessment)
      setCurrentStep('guidelines')
    } else {
      // Fallback to API call
      console.log('Fetching assessment from API')
      fetchCandidateAssessment(data.candidateId || data.id || 'demo')
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

  const handleExamComplete = (examResults: any) => {
    console.log('Exam completed with results:', examResults)
    
    // Handle different result formats from different exam types
    if (examResults.answers) {
      setAnswers(examResults.answers)
    } else if (examResults.candidateId) {
      // This is from coding exam - format as answers
      setAnswers({
        submissions: examResults.submissions,
        violations: examResults.violations,
        totalTimeSpent: examResults.totalTimeSpent,
        problemsCompleted: examResults.problemsCompleted
      })
    } else {
      // Fallback - treat the whole object as answers
      setAnswers(examResults)
    }
    
    setCurrentStep('summary')
  }

  const handleSubmitAssessment = async () => {
    try {
      console.log('Submitting assessment with data:', {
        candidateId: candidateData?.candidateId || candidateData?.id,
        assessmentId: assessmentData?.id,
        answers: answers
      })
      
      // Get authentication token
      const authToken = sessionStorage.getItem('authToken')
      
      // Format answers for backend submission
      const formattedAnswers: any[] = []
      
      if (answers.submissions && Array.isArray(answers.submissions)) {
        // This is from coding exam
        answers.submissions.forEach((submission: any, idx: number) => {
          formattedAnswers.push({
            questionId: assessmentData?.questions?.[idx]?.id || `question-${idx}`,
            answer: submission.code,
            timeSpent: submission.runtime || 0,
            language: submission.language,
            score: submission.score || 0
          })
        })
      } else {
        // This is from MCQ exam - convert answers object to array
        Object.entries(answers).forEach(([questionIndex, answer]) => {
          if (questionIndex !== 'totalTimeSpent' && answer) {
            const questionId = assessmentData?.questions?.[parseInt(questionIndex)]?.id || `question-${questionIndex}`
            formattedAnswers.push({
              questionId: questionId,
              answer: answer,
              timeSpent: 0
            })
          }
        })
      }
      
      const submissionData = {
        answers: formattedAnswers,
        totalTimeSpent: answers.totalTimeSpent || 0,
        timestamp: new Date().toISOString()
      }
      
      console.log('Formatted submission data:', submissionData)
      
      // Use candidateId (external ID) instead of id (internal database ID)
      const candidateId = candidateData?.candidateId || candidateData?.id
      const response = await fetch(`http://localhost:5000/api/candidate-assessment/${assessmentData?.id}/candidate/${candidateId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissionData),
      })

      const result = await response.json()
      console.log('Submission result:', result)
      
      if (response.ok) {
        setSubmissionResult(result)
        setCurrentStep('thank-you')
      } else {
        alert('Failed to submit assessment: ' + (result.message || result.error))
      }
    } catch (error) {
      console.error('Error submitting assessment:', error)
      alert('Failed to submit assessment. Please try again.')
    }
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'login':
        return <CandidateLogin onSuccess={handleLoginSuccess} />
      
      case 'guidelines':
        return (
          <AssessmentGuidelines
            candidateData={candidateData}
            assessmentData={assessmentData}
            onAccept={handleGuidelinesAccept}
          />
        )
      
      case 'system-checks':
        return (
          <SystemChecks
            onComplete={handleSystemChecksComplete}
          />
        )
      
      case 'exam':
        // Determine exam type - check for coding questions vs multiple choice
        const hasCodingQuestions = assessmentData?.questions?.some((q: any) => 
          q.type === 'coding' || q.codingData
        )
        
        console.log('Assessment data for exam:', assessmentData)
        console.log('Has coding questions:', hasCodingQuestions)
        console.log('Assessment type:', assessmentData?.type)
        
        return hasCodingQuestions || assessmentData?.type === 'coding' ? (
          <CodingExam
            candidateData={candidateData}
            systemStatus={{}} // Add system status if needed
            assessment={assessmentData}
            onComplete={handleExamComplete}
          />
        ) : (
          <ProctoredExam
            candidateData={candidateData}
            systemStatus={{}} // Add system status if needed
            onComplete={handleExamComplete}
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
        return (
          <ThankYou 
            candidateData={candidateData}
            assessmentData={assessmentData}
            submissionResult={submissionResult}
          />
        )
      
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
