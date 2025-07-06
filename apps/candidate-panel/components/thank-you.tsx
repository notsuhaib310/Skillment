"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Trophy, Star, Clock, Target, Award, Calendar } from "lucide-react"

interface ThankYouProps {
  candidateData?: any
  assessmentData?: any
  submissionResult?: any
}

export default function ThankYou({ candidateData, assessmentData, submissionResult }: ThankYouProps) {
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Enter fullscreen for thank you message
    document.documentElement.requestFullscreen().catch((error: any) => {
      alert("Fullscreen required for thank you screen: " + (error?.message || error))
    })
    // Strict enforcement
    const enforceFullscreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {
          alert("Fullscreen required for thank you screen. Please allow fullscreen mode.")
        })
      }
    }
    document.addEventListener("fullscreenchange", enforceFullscreen)
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" || e.key === "F11") {
        e.preventDefault()
        e.stopPropagation()
        alert(`${e.key} key blocked (fullscreen exit attempt). Fullscreen is required.`)
        return false
      }
    }, true)

    // Countdown and auto-close
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Exit fullscreen
          if (document.fullscreenElement) {
            document.exitFullscreen()
          }

          // Close the window/tab
          setTimeout(() => {
            window.close()

            // If window.close() doesn't work, redirect to blank page
            setTimeout(() => {
              window.location.href = "about:blank"
            }, 500)
          }, 500)

          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b0d] via-[#1a1d21] to-[#0a0b0d] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
        <CardContent className="p-12 text-center">
          {/* Success Animation */}
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>

            {/* Floating stars */}
            <div className="absolute top-0 left-1/4 animate-bounce">
              <Star className="w-6 h-6 text-yellow-400 fill-current" />
            </div>
            <div className="absolute top-4 right-1/4 animate-bounce delay-300">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
            </div>
            <div className="absolute bottom-4 left-1/3 animate-bounce delay-700">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
            </div>
          </div>

          <h1 className="text-5xl font-bold text-white mb-4">Thank You{candidateData?.name ? `, ${candidateData.name}` : ''}!</h1>

          <p className="text-2xl text-gray-300 mb-8">Your assessment has been completed successfully</p>

          <div className="flex items-center justify-center space-x-3 mb-8">
            <Trophy className="w-8 h-8 text-[#ff4d00]" />
            <span className="text-[#ff4d00] font-bold text-xl">Assessment Submitted</span>
            <Trophy className="w-8 h-8 text-[#ff4d00]" />
          </div>

          {/* Assessment Summary */}
          {assessmentData && (
            <div className="bg-white/5 p-6 rounded-lg border border-white/10 mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Assessment Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-[#ff4d00]" />
                  <span className="text-gray-300">Assessment:</span>
                  <span className="text-white font-medium">{assessmentData.title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-[#ff4d00]" />
                  <span className="text-gray-300">Duration:</span>
                  <span className="text-white font-medium">{assessmentData.duration} minutes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-[#ff4d00]" />
                  <span className="text-gray-300">Questions:</span>
                  <span className="text-white font-medium">{assessmentData.totalQuestions || assessmentData.questions?.length || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-[#ff4d00]" />
                  <span className="text-gray-300">Total Marks:</span>
                  <span className="text-white font-medium">{assessmentData.totalMarks || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2 col-span-2">
                  <Calendar className="w-4 h-4 text-[#ff4d00]" />
                  <span className="text-gray-300">Submitted:</span>
                  <span className="text-white font-medium">{new Date().toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Results Preview (if available) */}
          {submissionResult && (
            <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 p-6 rounded-lg border border-green-500/30 mb-8">
              <h3 className="text-xl font-semibold text-green-400 mb-4">Preliminary Results</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {submissionResult.score !== undefined && submissionResult.totalMarks && (
                  <>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400">{submissionResult.score}</div>
                      <div className="text-gray-300">Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-400">{submissionResult.percentage || Math.round((submissionResult.score / submissionResult.totalMarks) * 100)}%</div>
                      <div className="text-gray-300">Percentage</div>
                    </div>
                  </>
                )}
              </div>
              <div className="mt-4 text-center">
                <Badge className="bg-green-900/30 text-green-400 border-green-500/30">
                  Results processed successfully
                </Badge>
              </div>
            </div>
          )}

          <div className="space-y-3 text-gray-400 mb-8">
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>All responses have been recorded securely</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Security verification completed successfully</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>{submissionResult ? 'Results have been processed' : 'Results will be processed shortly'}</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>You will be notified of your final results</span>
            </div>
          </div>

          {/* Countdown */}
          <div className="bg-white/5 p-6 rounded-lg border border-white/10">
            <div className="text-3xl font-bold text-[#ff4d00] mb-2">{countdown}</div>
            <p className="text-gray-300">This window will close automatically</p>
          </div>

          {/* Footer message */}
          <div className="mt-8 text-sm text-gray-500">
            <p>Thank you for using Skillment Assessment Platform</p>
            <p>© 2024 Skillment. All rights reserved.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
