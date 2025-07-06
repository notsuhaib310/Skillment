"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, Trophy, Clock, Shield } from "lucide-react"

interface ExamSummaryProps {
  results: any
  onComplete: () => void
}

export default function ExamSummary({ results, onComplete }: ExamSummaryProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [countdown, setCountdown] = useState(10)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Automatic fullscreen enforcement
  useEffect(() => {
    const enforceFullscreen = () => {
      if (!document.fullscreenElement) {
        // Instantly force back to fullscreen without any warnings
        document.documentElement.requestFullscreen().catch((error) => {
          console.log('Fullscreen enforcement failed:', error);
          // Retry after a short delay
          setTimeout(() => {
            document.documentElement.requestFullscreen().catch(() => {
              // If fullscreen completely fails, we still don't show warnings
              console.log('Fullscreen enforcement retry failed');
            });
          }, 100);
        });
      }
    };

    // Force fullscreen on component mount
    enforceFullscreen();

    // Monitor fullscreen changes and instantly re-enter
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        // Use requestAnimationFrame for immediate execution
        requestAnimationFrame(() => {
          enforceFullscreen();
        });
      }
    };

    // Also monitor visibility changes (tab switches)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // When tab becomes visible again, ensure fullscreen
        setTimeout(enforceFullscreen, 50);
      }
    };

    // Add event listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Block Escape key to prevent fullscreen exit
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'F11') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    // Cleanup
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  useEffect(() => {
    // Submit results to backend first
    submitResultsToBackend()
    
    // Auto-proceed countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [onComplete])

  const submitResultsToBackend = async () => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    setSubmitError("")

    try {
      const token = sessionStorage.getItem('authToken')
      const candidateData = JSON.parse(sessionStorage.getItem('candidateData') || '{}')
      const selectedAssessment = JSON.parse(sessionStorage.getItem('selectedAssessment') || '{}')
      
      const submissionData = {
        candidateId: candidateData.candidateId || candidateData.id,
        assessmentId: selectedAssessment.id,
        answers: results.answers,
        violations: results.violations || 0,
        violationLogs: results.violationLogs || [],
        timeSpent: results.timeSpent || 0,
        autoSubmit: results.autoSubmit || false,
        reason: results.reason || "",
        score: results.score || 0,
        totalQuestions: results.totalQuestions || 0,
        timestamp: results.timestamp || new Date().toISOString(),
      }

      console.log('📝 Submitting assessment data:', submissionData);
      console.log('📋 Answers being submitted:', submissionData.answers);
      console.log('🔑 Answer keys:', Object.keys(submissionData.answers || {}));

      const response = await fetch(`http://localhost:5000/api/candidates/submit-assessment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submissionData)
      })

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Submission failed:', response.status, errorData);
        throw new Error(`Failed to submit assessment results: ${response.status} - ${errorData}`)
      }

      const responseData = await response.json()
      console.log('✅ Assessment submitted successfully:', responseData)
      setSubmitSuccess(true)
      
    } catch (error: any) {
      console.error('Failed to submit assessment:', error)
      setSubmitError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return "text-green-400"
    if (percentage >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  const getScoreBadge = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return "bg-green-900/30 text-green-400 border-green-500/30"
    if (percentage >= 60) return "bg-yellow-900/30 text-yellow-400 border-yellow-500/30"
    return "bg-red-900/30 text-red-400 border-red-500/30"
  }

  const getGrade = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 90) return "A+"
    if (percentage >= 80) return "A"
    if (percentage >= 70) return "B+"
    if (percentage >= 60) return "B"
    if (percentage >= 50) return "C"
    return "F"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b0d] via-[#1a1d21] to-[#0a0b0d] p-4 flex items-center justify-center">
      <Card className="w-full max-w-4xl bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Assessment Complete</h1>
            <p className="text-gray-400">Your responses have been submitted and analyzed</p>

            {/* Submission Status */}
            <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
              {isSubmitting && (
                <div className="flex items-center justify-center gap-2 text-blue-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                  <span className="text-sm">Submitting results to server...</span>
                </div>
              )}
              {submitSuccess && !isSubmitting && (
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Results submitted successfully!</span>
                </div>
              )}
              {submitError && !isSubmitting && (
                <div className="flex items-center justify-center gap-2 text-red-400">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm">Failed to submit: {submitError}</span>
                </div>
              )}
            </div>

            {/* Auto-proceed countdown */}
            <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm text-gray-300">
                Automatically proceeding in <span className="font-bold text-[#ff4d00]">{countdown}</span> seconds
              </p>
            </div>
          </div>

          {/* Main Score Display */}
          <div className="text-center mb-8">
            <div className={`text-6xl font-bold mb-2 ${getScoreColor(results.score, results.totalQuestions)}`}>
              {results.score}/{results.totalQuestions}
            </div>
            <div className="text-2xl font-semibold text-white mb-2">
              Grade: {getGrade(results.score, results.totalQuestions)}
            </div>
            <Badge className={`text-lg px-4 py-2 ${getScoreBadge(results.score, results.totalQuestions)}`}>
              {Math.round((results.score / results.totalQuestions) * 100)}%
            </Badge>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center p-6 bg-white/5 rounded-lg border border-white/10">
              <Trophy className="w-8 h-8 text-[#ff4d00] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white mb-1">{results.score}</div>
              <div className="text-gray-400 text-sm">Correct Answers</div>
            </div>

            <div className="text-center p-6 bg-white/5 rounded-lg border border-white/10">
              <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white mb-1">{formatTime(results.timeSpent)}</div>
              <div className="text-gray-400 text-sm">Time Spent</div>
            </div>

            <div className="text-center p-6 bg-white/5 rounded-lg border border-white/10">
              <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className={`text-2xl font-bold mb-1 ${results.violations > 0 ? "text-red-400" : "text-green-400"}`}>
                {results.violations}
              </div>
              <div className="text-gray-400 text-sm">Security Violations</div>
            </div>

            <div className="text-center p-6 bg-white/5 rounded-lg border border-white/10">
              <CheckCircle className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white mb-1">{Object.keys(results.answers).length}</div>
              <div className="text-gray-400 text-sm">Questions Attempted</div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="space-y-4 mb-8">
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              {showDetails ? "Hide Details" : "Show Detailed Results"}
            </Button>

            {showDetails && (
              <div className="space-y-4">
                {/* Question Breakdown */}
                <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Question-by-Question Analysis</h3>
                  <div className="space-y-3">
                    {Object.entries(results.answers).map(([questionIndex, answer]) => {
                      const correctAnswers = [
                        "Paris",
                        "O(log n)",
                        "All of the above",
                        "Hyper Text Markup Language",
                        "Stack",
                      ]
                      const isCorrect = correctAnswers[Number.parseInt(questionIndex)] === answer
                      const questionNum = Number.parseInt(questionIndex) + 1

                      return (
                        <div key={questionIndex} className="flex items-center justify-between p-3 bg-white/5 rounded">
                          <div className="flex items-center space-x-3">
                            <span className="text-gray-300 font-medium">Question {questionNum}</span>
                            {isCorrect ? (
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-400" />
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-gray-400 text-sm">Your Answer:</div>
                            <div className={`text-sm ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                              {answer as string}
                            </div>
                            {!isCorrect && (
                              <div className="text-xs text-gray-500">
                                Correct: {correctAnswers[Number.parseInt(questionIndex)]}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Security Report */}
                {results.violations > 0 && (
                  <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      <h3 className="text-lg font-semibold text-red-400">Security Violations Detected</h3>
                    </div>
                    <p className="text-red-300 text-sm mb-3">
                      {results.violations} violation(s) were detected during your assessment.
                    </p>
                    {results.violationLogs && (
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-red-400">Violation Log:</h4>
                        {results.violationLogs.slice(-5).map((log: string, index: number) => (
                          <div key={index} className="text-xs text-red-300 font-mono bg-red-900/20 p-2 rounded">
                            {log}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Submission Details */}
                <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Submission Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Candidate ID:</span>
                      <span className="text-white ml-2">{results.candidateId}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Submission Type:</span>
                      <span className={`ml-2 ${results.autoSubmit ? "text-red-400" : "text-green-400"}`}>
                        {results.autoSubmit ? "Auto-submitted" : "Manual submission"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Submitted At:</span>
                      <span className="text-white ml-2">{new Date(results.timestamp).toLocaleString()}</span>
                    </div>
                    {results.reason && (
                      <div>
                        <span className="text-gray-400">Reason:</span>
                        <span className="text-white ml-2">{results.reason}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button
              onClick={onComplete}
              className="bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] hover:from-[#e63900] hover:to-[#ff5722] text-white px-8 py-3"
            >
              Continue ({countdown}s)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
