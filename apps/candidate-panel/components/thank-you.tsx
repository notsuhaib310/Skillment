"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Trophy, Star } from "lucide-react"

export default function ThankYou() {
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Enter fullscreen for thank you message
    document.documentElement.requestFullscreen().catch(() => {})

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

          <h1 className="text-5xl font-bold text-white mb-4">Thank You!</h1>

          <p className="text-2xl text-gray-300 mb-8">Your assessment has been completed successfully</p>

          <div className="flex items-center justify-center space-x-3 mb-8">
            <Trophy className="w-8 h-8 text-[#ff4d00]" />
            <span className="text-[#ff4d00] font-bold text-xl">Assessment Submitted</span>
            <Trophy className="w-8 h-8 text-[#ff4d00]" />
          </div>

          <div className="space-y-3 text-gray-400 mb-8">
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>All responses have been recorded</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Security verification completed</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Results will be processed shortly</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>You will be notified of your results</span>
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
