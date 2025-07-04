"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  ArrowLeft,
  Key, 
  Copy, 
  Mail, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Target,
  Users,
  Send
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CandidateCredential {
  candidateId: string
  name: string
  email: string
  status: string
  allottedAt: string
  credentialExists: boolean
  credentialSent: boolean
  lastSentAt: string | null
  loginId: string | null
}

interface Assessment {
  id: string
  title: string
  type: string
  duration: number
  totalMarks: number
}

export default function CredentialsPage() {
  const [candidateCredentials, setCandidateCredentials] = useState<CandidateCredential[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [selectedAssessment, setSelectedAssessment] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [credentialsLoading, setCredentialsLoading] = useState(false)
  const [resendingCredentials, setResendingCredentials] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    loadAssessments()
    const assessmentId = searchParams.get('assessmentId')
    if (assessmentId) {
      setSelectedAssessment(assessmentId)
    }
  }, [searchParams])

  useEffect(() => {
    if (selectedAssessment && Array.isArray(assessments) && assessments.length > 0) {
      loadCandidateCredentials()
    }
  }, [selectedAssessment, assessments])

  const loadAssessments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/assessments', {
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setAssessments(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error('Error loading assessments:', error)
      setAssessments([])
      toast({
        title: "Error Loading Assessments",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadCandidateCredentials = async () => {
    if (!selectedAssessment) return
    
    setCredentialsLoading(true)
    try {
      const response = await fetch(`http://localhost:5000/api/admin/candidates/assessment/${selectedAssessment}/credentials`, {
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setCandidateCredentials(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error('Error loading credentials:', error)
      setCandidateCredentials([])
      toast({
        title: "Error Loading Credentials",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setCredentialsLoading(false)
    }
  }

  const resendCredentials = async (candidateId: string) => {
    setResendingCredentials(candidateId)
    try {
      const response = await fetch(`http://localhost:5000/api/admin/candidates/${candidateId}/resend-credentials`, {
        method: 'POST',
        credentials: 'include',
      })
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Credentials Sent",
          description: `New credentials sent to candidate successfully`,
        })
        // Reload credentials to update the status
        loadCandidateCredentials()
      } else {
        throw new Error(data.error || 'Failed to send credentials')
      }
    } catch (error: any) {
      toast({
        title: "Error Sending Credentials",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setResendingCredentials(null)
    }
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      invited: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      started: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      completed: "bg-green-500/20 text-green-400 border-green-500/30",
      expired: "bg-red-500/20 text-red-400 border-red-500/30",
    }
    return colors[status as keyof typeof colors] || colors.invited
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading credentials...</p>
        </div>
      </div>
    )
  }

  const currentAssessment = Array.isArray(assessments) ? assessments.find(a => a.id === selectedAssessment) : null
  const sentCredentials = Array.isArray(candidateCredentials) ? candidateCredentials.filter(c => c.credentialSent).length : 0
  const totalCredentials = Array.isArray(candidateCredentials) ? candidateCredentials.length : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="icon"
            className="rounded-xl"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Credentials Management
            </h1>
            <p className="text-muted-foreground">
              Manage candidate login credentials and access
            </p>
          </div>
        </div>
      </div>

      {/* Assessment Selector */}
      <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Select Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <select
              value={selectedAssessment}
              onChange={(e) => setSelectedAssessment(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select an assessment...</option>
              {Array.isArray(assessments) && assessments.map((assessment) => (
                <option key={assessment.id} value={assessment.id}>
                  {assessment.title} ({assessment.type.toUpperCase()})
                </option>
              ))}
            </select>
            {selectedAssessment && (
              <Button onClick={loadCandidateCredentials} variant="outline" className="rounded-xl">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedAssessment && currentAssessment && (
        <>
          {/* Overview Cards */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Total Credentials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{totalCredentials}</div>
              </CardContent>
            </Card>

            <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Sent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-400">{sentCredentials}</div>
              </CardContent>
            </Card>

            <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-400">{totalCredentials - sentCredentials}</div>
              </CardContent>
            </Card>

            <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {totalCredentials > 0 ? `${Math.round((sentCredentials / totalCredentials) * 100)}%` : "0%"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Credentials Table */}
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Candidate Credentials ({candidateCredentials.length})
                </CardTitle>
                <Button onClick={loadCandidateCredentials} variant="outline" className="rounded-xl">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {credentialsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : candidateCredentials.length === 0 ? (
                <div className="text-center py-8">
                  <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No candidate credentials found for this assessment</p>
                  <Button 
                    onClick={() => router.push(`/dashboard/assessments/candidates?assessmentId=${selectedAssessment}`)}
                    className="rounded-xl primary-gradient glow-primary"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Allocate Candidates First
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Login ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Credentials Sent</TableHead>
                      <TableHead>Last Sent</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidateCredentials.map((credential) => (
                      <TableRow key={credential.candidateId}>
                        <TableCell className="font-medium">{credential.name}</TableCell>
                        <TableCell>{credential.email}</TableCell>
                        <TableCell>
                          {credential.loginId ? (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-mono">
                                {credential.loginId}
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(credential.loginId!, 'Login ID')}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not generated</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={`rounded-xl border ${getStatusColor(credential.status)}`}>
                            {credential.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {credential.credentialSent ? (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span>Sent</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-red-600">
                              <XCircle className="h-4 w-4" />
                              <span>Not Sent</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {credential.lastSentAt
                            ? new Date(credential.lastSentAt).toLocaleDateString()
                            : "Never"}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resendCredentials(credential.candidateId)}
                            disabled={resendingCredentials === credential.candidateId}
                            className="rounded-xl"
                          >
                            {resendingCredentials === credential.candidateId ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2" />
                            ) : (
                              <Mail className="mr-2 h-3 w-3" />
                            )}
                            {credential.credentialSent ? 'Resend' : 'Send'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}