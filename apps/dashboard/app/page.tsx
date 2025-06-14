"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Rocket, Laptop, Smartphone, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { verifySession } from "@/lib/auth-client"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function HomePage() {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

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

    // Verify authentication
    const verifyAuth = async () => {
      try {
        const session = await verifySession()
        if (!session.success) {
          window.location.href = "http://localhost:3000/login"
          return
        }

        setUser(session.user)
      } catch (error) {
        console.error("Auth verification error:", error)
        window.location.href = "http://localhost:3000/login"
      } finally {
        setIsLoading(false)
      }
    }

    setIsMobile(checkMobile())
    verifyAuth()

    // If not mobile, redirect after animation
    if (!checkMobile()) {
      const timer = setTimeout(() => {
        router.push("/dashboard")
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Mobile Icon Animation */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative bg-white rounded-full p-8 shadow-2xl border border-gray-100">
              <Smartphone className="h-16 w-16 text-blue-500 mx-auto animate-bounce" />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TalentHub Dashboard
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">This platform is optimized for desktop experience</p>
          </div>

          {/* Mobile Message */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <Laptop className="h-6 w-6 text-blue-500" />
              <span className="text-gray-700 font-medium">Desktop Recommended</span>
            </div>
            <p className="text-gray-600 text-sm">
              For the best experience, please access TalentHub on your PC or laptop
            </p>
            <div className="pt-2">
              <div className="inline-flex items-center space-x-2 text-sm text-purple-600 bg-purple-50 px-4 py-2 rounded-full">
                <Smartphone className="h-4 w-4" />
                <span className="font-medium">Mobile App Coming Soon!</span>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <Button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Continue Anyway
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <p className="text-xs text-gray-500">Note: Some features may not work optimally on mobile devices</p>
        </div>
      </div>
    )
  }

  // Desktop Loading/Redirect Screen
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      <div className="text-center space-y-8 relative">
        {/* Background Animation */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        {/* Main Card */}
        <div className="card-gradient rounded-3xl border-border/40 shadow-xl p-8 max-w-md mx-auto">
          {/* Rocket Animation */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-2xl opacity-40 animate-pulse"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-full p-12 shadow-2xl border border-border/40 transform hover:scale-105 transition-transform duration-300">
              <Rocket className="h-20 w-20 text-blue-500 mx-auto animate-bounce transform rotate-45" />
            </div>
          </div>

          {/* Loading Text */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-fade-in">
              Welcome, {user?.firstName}!
            </h1>
            <div className="flex items-center justify-center space-x-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce animation-delay-200"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce animation-delay-400"></div>
              </div>
              <span className="text-foreground text-lg font-medium">Launching Dashboard</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full mt-8">
            <div className="bg-gray-200/50 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full animate-progress"></div>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-muted-foreground text-sm mt-4 animate-fade-in-delay">Preparing your workspace...</p>
        </div>
      </div>
    </div>
  )
}
