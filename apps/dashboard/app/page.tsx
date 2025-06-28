"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Monitor, Smartphone, ArrowRight, CheckCircle, BarChart3, Users, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent.toLowerCase(),
      )
      const isSmallScreen = window.innerWidth < 768
      return isMobileDevice || isSmallScreen
    }

    setIsMobile(checkMobile())
    setIsLoading(false)

    // If not mobile, show progress and redirect
    if (!checkMobile()) {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            setTimeout(() => router.push("/dashboard"), 500)
            return 100
          }
          return prev + 2
        })
      }, 50)

      return () => clearInterval(progressInterval)
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Skillment</h1>
                <p className="text-orange-400 text-sm">Event Management Platform</p>
              </div>
            </div>
          </div>

          {/* Mobile Warning Card */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-700 rounded-2xl flex items-center justify-center mx-auto">
                <Smartphone className="w-8 h-8 text-orange-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Desktop Experience Required</h2>
                <p className="text-gray-400">
                  Skillment is optimized for desktop and laptop computers to provide the best event management
                  experience.
                </p>
              </div>
            </div>

            {/* Features that require desktop */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-orange-400" />
                </div>
                <span className="text-sm">Advanced Analytics Dashboard</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-orange-400" />
                </div>
                <span className="text-sm">Participant Management Tools</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-orange-400" />
                </div>
                <span className="text-sm">Event Planning Interface</span>
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <Monitor className="w-5 h-5 text-orange-400" />
                <div>
                  <p className="text-orange-300 font-medium text-sm">Recommended</p>
                  <p className="text-orange-400/80 text-xs">Access Skillment on your computer for full functionality</p>
                </div>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="space-y-4">
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 h-12 rounded-xl font-medium transition-colors"
            >
              Continue to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-xs text-gray-500 text-center">
              Note: Some features may have limited functionality on mobile devices
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Desktop Loading Screen
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 overflow-hidden relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fillRule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fillOpacity=&quot;0.1&quot;%3E%3Ccircle cx=&quot;7&quot; cy=&quot;7&quot; r=&quot;7&quot;/%3E%3Ccircle cx=&quot;53&quot; cy=&quot;7&quot; r=&quot;7&quot;/%3E%3Ccircle cx=&quot;7&quot; cy=&quot;53&quot; r=&quot;7&quot;/%3E%3Ccircle cx=&quot;53&quot; cy=&quot;53&quot; r=&quot;7&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
      </div>
      <div className="relative z-10 max-w-xl w-full mx-auto px-8">
        <div className="bg-gray-800/60 backdrop-blur-md rounded-3xl border border-gray-700/50 p-14 space-y-12 shadow-2xl">
          {/* Logo and Branding */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Shield className="w-9 h-9 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl blur opacity-25"></div>
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Skillment</h1>
            <p className="text-gray-400">Event Management Platform</p>
          </div>

          {/* Loading Status */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white mb-2">Initializing Dashboard</h2>
              <p className="text-gray-400 text-sm">Setting up your workspace...</p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-orange-500 to-orange-600 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Loading...</span>
                <span>{progress}%</span>
              </div>
            </div>

            {/* Loading Steps */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className={`w-4 h-4 ${progress > 20 ? "text-green-400" : "text-gray-600"}`} />
                <span className={`text-sm ${progress > 20 ? "text-white" : "text-gray-500"}`}>
                  Authenticating session
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className={`w-4 h-4 ${progress > 50 ? "text-green-400" : "text-gray-600"}`} />
                <span className={`text-sm ${progress > 50 ? "text-white" : "text-gray-500"}`}>
                  Loading dashboard components
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className={`w-4 h-4 ${progress > 80 ? "text-green-400" : "text-gray-600"}`} />
                <span className={`text-sm ${progress > 80 ? "text-white" : "text-gray-500"}`}>Preparing workspace</span>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="pt-4 border-t border-gray-700">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
