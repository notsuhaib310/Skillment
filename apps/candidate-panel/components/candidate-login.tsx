"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Wifi, WifiOff, Shield } from "lucide-react"

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
  useState(() => {
    const checkConnection = () => {
      setInternetStatus(navigator.onLine)
    }

    window.addEventListener("online", checkConnection)
    window.addEventListener("offline", checkConnection)

    return () => {
      window.removeEventListener("online", checkConnection)
      window.removeEventListener("offline", checkConnection)
    }
  })

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

    // Simulate API call for authentication
    setTimeout(() => {
      // Mock validation - in real app, this would be an API call
      if (formData.candidateId.length >= 3 && formData.password.length >= 6) {
        onSuccess({
          candidateId: formData.candidateId,
          password: formData.password,
          assessmentType: assessmentType,
          fullName: "John Doe",
          email: "john.doe@example.com",
          phone: "+1234567890",
        })
      } else {
        setError("Invalid credentials. Please check your Candidate ID and Password.")
        setIsLoading(false)
      }
    }, 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0b0d] p-4">
      <Card className="w-full max-w-md bg-[#1a1d21] border-[#2a2d31] shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-white mb-2">Skillment Assessment</CardTitle>
          <p className="text-gray-400 text-sm">Secure Proctored Examination Portal</p>

          {/* Security Badge */}
          <div className="flex items-center justify-center space-x-2 mt-4 p-2 bg-[#ff4d00]/10 border border-[#ff4d00]/30 rounded-lg">
            <Shield className="w-4 h-4 text-[#ff4d00]" />
            <span className="text-sm text-[#ff4d00] font-medium">AI-Powered Proctoring Enabled</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Internet Status */}
          <div className="flex items-center justify-center space-x-2 p-3 rounded-lg bg-[#2a2d31]">
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
              <Label htmlFor="candidateId" className="text-gray-300 font-medium">
                Candidate ID *
              </Label>
              <Input
                id="candidateId"
                type="text"
                placeholder="Enter your candidate ID"
                value={formData.candidateId}
                onChange={(e) => setFormData({ ...formData, candidateId: e.target.value })}
                required
                className="h-12 bg-[#2a2d31] border-[#3a3d41] text-white placeholder:text-gray-500 focus:border-[#ff4d00] focus:ring-[#ff4d00] text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300 font-medium">
                Password *
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="h-12 bg-[#2a2d31] border-[#3a3d41] text-white placeholder:text-gray-500 focus:border-[#ff4d00] focus:ring-[#ff4d00] text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300 font-medium">Assessment Type *</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAssessmentType("mcq")}
                  className={`h-12 rounded-lg border-2 transition-all duration-200 flex items-center justify-center space-x-2 ${
                    assessmentType === "mcq"
                      ? "border-[#ff4d00] bg-[#ff4d00]/10 text-[#ff4d00]"
                      : "border-[#3a3d41] bg-[#2a2d31] text-gray-400 hover:border-[#ff4d00]/50"
                  }`}
                >
                  <span className="font-medium">MCQ Test</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAssessmentType("coding")}
                  className={`h-12 rounded-lg border-2 transition-all duration-200 flex items-center justify-center space-x-2 ${
                    assessmentType === "coding"
                      ? "border-[#ff4d00] bg-[#ff4d00]/10 text-[#ff4d00]"
                      : "border-[#3a3d41] bg-[#2a2d31] text-gray-400 hover:border-[#ff4d00]/50"
                  }`}
                >
                  <span className="font-medium">Coding Test</span>
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] hover:from-[#e63900] hover:to-[#ff5722] text-white font-semibold shadow-lg text-lg"
              disabled={isLoading || !internetStatus}
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

          <div className="text-center text-xs text-gray-500 mt-6 space-y-1">
            <p>⚠️ This is a proctored examination</p>
            <p>By continuing, you agree to continuous monitoring</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
