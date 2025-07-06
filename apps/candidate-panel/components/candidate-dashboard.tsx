"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Clock, 
  BookOpen, 
  Users, 
  Target, 
  Calendar,
  Shield,
  Play,
  FileText,
  Code,
  Award,
  Timer,
  AlertCircle,
  CheckCircle,
  User,
  LogOut
} from "lucide-react"
import { motion } from "framer-motion"

interface CandidateDashboardProps {
  candidateData: any
  onStartAssessment: (assessment: any) => void
  onLogout: () => void
}

export default function CandidateDashboard({ candidateData, onStartAssessment, onLogout }: CandidateDashboardProps) {
  const [assessments, setAssessments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchAssessments()
  }, [])

  const fetchAssessments = async () => {
    try {
      setLoading(true)
      setError("")
      
      // Use the assigned assessment from login data if available
      if (candidateData.allAssignments && candidateData.allAssignments.length > 0) {
        console.log('Using assessments from login data:', candidateData.allAssignments)
        setAssessments(candidateData.allAssignments)
        setLoading(false)
        return
      }
      
      // Fallback to API call with candidateId or email
      const candidateId = candidateData.candidateId
      const email = candidateData.email
      
      let apiUrl = 'http://localhost:5000/api/candidate/assessments'
      if (candidateId) {
        apiUrl += `?candidateId=${encodeURIComponent(candidateId)}`
      } else if (email) {
        apiUrl += `?email=${encodeURIComponent(email)}`
      }
      
      console.log('Fetching assessments from:', apiUrl)
      
      const response = await fetch(apiUrl, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Assessment API response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.text()
        console.error('Assessment API error:', errorData)
        throw new Error(`Failed to fetch assessments: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Fetched assessments:', data)
      setAssessments(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error('Error fetching assessments:', err)
      setError(err.message || "Failed to load assessments")
      
      // If API fails, check if we have assessment data from login
      if (candidateData.assignedAssessment) {
        console.log('Using single assessment from login data')
        setAssessments([{
          id: candidateData.id || 'single-assessment',
          candidate: candidateData,
          assessment: candidateData.assignedAssessment,
          status: candidateData.status || 'invited'
        }])
        setError("") // Clear error since we have fallback data
      }
    } finally {
      setLoading(false)
    }
  }

  const getAssessmentIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'coding': return Code
      case 'mcq': return FileText
      case 'hybrid': return BookOpen
      default: return FileText
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'invited': return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case 'started': return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case 'completed': return "bg-green-500/20 text-green-400 border-green-500/30"
      case 'expired': return "bg-red-500/20 text-red-400 border-red-500/30"
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const canStartAssessment = (assessment: any) => {
    const status = assessment.status?.toLowerCase()
    return status === 'invited' || status === 'started'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#181c24] via-[#23272f] to-[#0a0b0d] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff4d00] mx-auto"></div>
          <p className="text-gray-300">Loading your assessments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181c24] via-[#23272f] to-[#0a0b0d] relative overflow-hidden">
      {/* Animated Gradient Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-[#ff4d00]/40 to-[#ff6b35]/30 rounded-full blur-3xl opacity-60 animate-pulse z-0" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tr from-[#ff6b35]/30 to-[#ff4d00]/40 rounded-full blur-2xl opacity-50 animate-pulse z-0" />
      
      {/* Header */}
      <div className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="40" height="40" rx="12" fill="url(#paint0_linear)" />
                  <text x="50%" y="58%" textAnchor="middle" fill="#fff" fontSize="1.5rem" fontWeight="bold" dy=".3em">S</text>
                  <defs>
                    <linearGradient id="paint0_linear" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#ff4d00" />
                      <stop offset="1" stopColor="#ff6b35" />
                    </linearGradient>
                  </defs>
                </svg>
                <div>
                  <h1 className="text-xl font-bold text-white">Skillment Assessment</h1>
                  <p className="text-sm text-gray-400">Candidate Portal</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-xl backdrop-blur-sm">
                <User className="h-4 w-4 text-[#ff4d00]" />
                <div className="text-sm">
                  <div className="text-white font-medium">{candidateData.name}</div>
                  <div className="text-gray-400">{candidateData.email}</div>
                </div>
              </div>
              <Button 
                onClick={onLogout}
                variant="outline" 
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-white">
              Welcome to Your Assessment Portal
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Your assigned assessments are listed below. Click "Start Assessment" when you're ready to begin.
            </p>
          </div>

          {error && (
            <Card className="bg-red-900/20 border-red-500/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assessments Grid */}
          {assessments.length === 0 ? (
            <Card className="bg-white/10 backdrop-blur-2xl border-white/10 text-center py-12">
              <CardContent>
                <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Assessments Found</h3>
                <p className="text-gray-400">
                  No assessments have been assigned to your account yet. Please contact your administrator.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {assessments.map((assessment, index) => {
                const IconComponent = getAssessmentIcon(assessment.assessment?.type)
                
                return (
                  <motion.div
                    key={assessment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="bg-white/10 backdrop-blur-2xl border-white/10 hover:bg-white/15 transition-all duration-300 group">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-[#ff4d00] to-[#ff6b35] rounded-xl">
                              <IconComponent className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-white text-lg group-hover:text-[#ff4d00] transition-colors">
                                {assessment.assessment?.title || 'Unnamed Assessment'}
                              </CardTitle>
                              <p className="text-gray-400 text-sm">
                                {assessment.assessment?.type?.toUpperCase() || 'GENERAL'} Assessment
                              </p>
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(assessment.status)} border rounded-xl`}>
                            {assessment.status || 'Unknown'}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-6">
                        {/* Assessment Details */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2 text-gray-300">
                            <Clock className="h-4 w-4 text-[#ff4d00]" />
                            <span className="text-sm">
                              {assessment.assessment?.duration || 60} minutes
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Target className="h-4 w-4 text-[#ff4d00]" />
                            <span className="text-sm">
                              {assessment.assessment?.totalQuestions || 0} questions
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Award className="h-4 w-4 text-[#ff4d00]" />
                            <span className="text-sm">
                              {assessment.assessment?.totalMarks || 0} marks
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Shield className="h-4 w-4 text-[#ff4d00]" />
                            <span className="text-sm">
                              {assessment.assessment?.enableProctoring ? 'Proctored' : 'Regular'}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        {assessment.assessment?.description && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-white">Description</h4>
                            <p className="text-gray-400 text-sm">
                              {assessment.assessment.description}
                            </p>
                          </div>
                        )}

                        {/* Instructions */}
                        {assessment.assessment?.instructions && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-white">Instructions</h4>
                            <p className="text-gray-400 text-sm">
                              {assessment.assessment.instructions}
                            </p>
                          </div>
                        )}

                        {/* Action Button */}
                        <div className="pt-4 border-t border-white/10">
                          {canStartAssessment(assessment) ? (
                            <Button
                              onClick={() => onStartAssessment(assessment.assessment)}
                              className="w-full bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] hover:from-[#e63900] hover:to-[#ff5722] text-white font-semibold"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Start Assessment
                            </Button>
                          ) : assessment.status?.toLowerCase() === 'completed' ? (
                            <div className="flex items-center justify-center gap-2 text-green-400">
                              <CheckCircle className="h-5 w-5" />
                              <span className="font-medium">Completed</span>
                            </div>
                          ) : (
                            <Button disabled className="w-full" variant="outline">
                              Assessment Not Available
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Footer */}
          <div className="text-center space-y-2 pt-8">
            <div className="flex items-center justify-center gap-2 text-[#ff4d00]">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Secure Assessment Environment</span>
            </div>
            <p className="text-gray-400 text-xs">
              Need help? Contact support at support@skillment.com
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 