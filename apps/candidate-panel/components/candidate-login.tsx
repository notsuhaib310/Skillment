"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Wifi, WifiOff, Shield } from "lucide-react"
import { motion } from "framer-motion"

interface CandidateLoginProps {
  onSuccess: (data: any) => void
}

export default function CandidateLogin({ onSuccess }: CandidateLoginProps) {
  const [formData, setFormData] = useState({
    candidateId: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [internetStatus, setInternetStatus] = useState(true)
  const [error, setError] = useState("")
  const [assessmentType, setAssessmentType] = useState<"mcq" | "coding">("mcq")

  // Check internet connection
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return

    const checkConnection = () => {
      setInternetStatus(navigator.onLine)
    }

    // Initial check
    checkConnection()

    window.addEventListener("online", checkConnection)
    window.addEventListener("offline", checkConnection)

    return () => {
      window.removeEventListener("online", checkConnection)
      window.removeEventListener("offline", checkConnection)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!internetStatus) {
      setError("Internet connection is required to proceed")
      return
    }

    if (!formData.candidateId || !formData.password) {
      setError("Please enter both Candidate ID and Password")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      console.log('Attempting login with:', { candidateId: formData.candidateId, passwordLength: formData.password.length })
      
      // First authenticate the candidate
      const res = await fetch('http://localhost:5000/api/candidates/login', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          candidateId: formData.candidateId.trim(), 
          password: formData.password 
        }),
      })
      
      const data = await res.json()
      console.log('Login response:', data)
      
      if (!res.ok) {
        throw new Error(data.error || data.message || "Login failed")
      }
      
      if (!data.success) {
        throw new Error(data.error || "Login failed")
      }
      
      // Fetch assigned assessment for this candidate using the correct endpoint
      const assessmentRes = await fetch(`http://localhost:5000/api/candidate/assessments?candidateId=${encodeURIComponent(formData.candidateId)}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Assessment fetch status:', assessmentRes.status)
      
      if (!assessmentRes.ok) {
        console.warn("Failed to fetch assigned assessments, proceeding with login data only")
        // Don't fail completely if assessment fetch fails
      }
      
      let assigned = []
      try {
        assigned = await assessmentRes.json()
        console.log('Assigned assessments:', assigned)
      } catch (parseError) {
        console.warn("Failed to parse assessment response:", parseError)
      }
      
      if (!assigned || assigned.length === 0) {
        console.warn("No assessments found, using candidate data from login")
        // Use assessment data from candidate login response
        if (data.candidate.assessment) {
          assigned = [{
            id: data.candidate.id,
            candidate: data.candidate,
            assessment: data.candidate.assessment
          }]
        } else {
          throw new Error("No assessments assigned to your account")
        }
      }
      
      // Store auth token and candidate data for future requests
      sessionStorage.setItem('authToken', data.token)
      sessionStorage.setItem('candidateData', JSON.stringify(data.candidate))
      
      // Determine assessment type from first assigned assessment
      const firstAssessment = assigned[0]?.assessment
      const assessmentType = firstAssessment?.type || 'multiple_choice'
      
      console.log('Proceeding with assessment type:', assessmentType)
      
      // Pass complete data to onSuccess
      onSuccess({ 
        candidateId: formData.candidateId,
        ...data.candidate, 
        token: data.token,
        assessmentType: assessmentType,
        assignedAssessment: firstAssessment,
        allAssignments: assigned
      })
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || "An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#181c24] via-[#23272f] to-[#0a0b0d] p-4">
      {/* Animated Gradient Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-[#ff4d00]/40 to-[#ff6b35]/30 rounded-full blur-3xl opacity-60 animate-pulse z-0" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tr from-[#ff6b35]/30 to-[#ff4d00]/40 rounded-full blur-2xl opacity-50 animate-pulse z-0" />
      {/* Glassmorphism Card with Animation */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="bg-white/10 backdrop-blur-2xl border-white/10 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6">
              {/* Skillment SVG Logo */}
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
                <rect width="56" height="56" rx="16" fill="url(#paint0_linear)" />
                <text x="50%" y="54%" textAnchor="middle" fill="#fff" fontSize="2.2rem" fontWeight="bold" dy=".3em">S</text>
                <defs>
                  <linearGradient id="paint0_linear" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ff4d00" />
                    <stop offset="1" stopColor="#ff6b35" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <CardTitle className="text-3xl font-extrabold text-white mb-2 tracking-tight drop-shadow">Skillment Assessment</CardTitle>
            <p className="text-gray-300 text-base font-medium">Secure Proctored Examination Portal</p>
            {/* Security Badge */}
            <div className="flex items-center justify-center space-x-2 mt-4 p-2 bg-[#ff4d00]/10 border border-[#ff4d00]/30 rounded-lg">
              <Shield className="w-4 h-4 text-[#ff4d00]" />
              <span className="text-sm text-[#ff4d00] font-medium">AI-Powered Proctoring Enabled</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Internet Status */}
            <div className="flex items-center justify-center space-x-2 p-3 rounded-lg bg-[#23272f]/80">
              {internetStatus ? (
                <>
                  <Wifi className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400 font-medium">Connection Stable</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400 font-medium">No Internet Connection</span>
                </>
              )}
            </div>
            {error && (
              <Alert className="bg-red-900/20 border-red-500/50">
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="candidateId" className="text-gray-200 font-semibold text-base">Candidate ID *</Label>
                <Input
                  id="candidateId"
                  type="text"
                  placeholder="Enter your Candidate ID"
                  value={formData.candidateId}
                  onChange={(e) => setFormData({ ...formData, candidateId: e.target.value })}
                  required
                  className="h-12 bg-[#23272f]/80 border-[#3a3d41] text-white placeholder:text-gray-500 focus:border-[#ff4d00] focus:ring-[#ff4d00] text-lg focus:outline-none focus:ring-2 transition-all"
                  aria-label="Candidate ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200 font-semibold text-base">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="h-12 bg-[#23272f]/80 border-[#3a3d41] text-white placeholder:text-gray-500 focus:border-[#ff4d00] focus:ring-[#ff4d00] text-lg focus:outline-none focus:ring-2 transition-all"
                  aria-label="Password"
                />
                <div className="flex justify-end mt-1">
                  <a href="#" className="text-xs text-[#ff6b35] hover:underline font-medium transition-all">Forgot password?</a>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] hover:from-[#e63900] hover:to-[#ff5722] text-white font-semibold shadow-lg text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4d00] transition-all duration-200"
                disabled={isLoading || !internetStatus}
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Start Assessment"
                )}
              </Button>
            </form>
            {/* Divider */}
            <div className="flex items-center gap-2 my-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#ff4d00]/40 to-transparent" />
              <span className="text-xs text-gray-500">or</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#ff4d00]/40 to-transparent" />
            </div>
            {/* Support Prompt */}
            <div className="text-center text-xs text-gray-400 mt-2 space-y-1">
              <p>⚠️ This is a proctored examination</p>
              <p>By continuing, you agree to continuous monitoring</p>
              <p className="mt-2">Need help? <a href="mailto:support@skillment.com" className="text-[#ff6b35] hover:underline font-medium">Contact Support</a></p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
