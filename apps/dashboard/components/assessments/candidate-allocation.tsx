"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, X, Mail, Users, Send, Check, AlertCircle, Upload, Download, Copy, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { candidatesApi, participantsApi } from "@/lib/api"

interface Candidate {
  name: string
  email: string
}

interface CandidateAllocationProps {
  assessmentId: string
  assessmentTitle: string
  onSuccess?: () => void
}

export function CandidateAllocation({ assessmentId, assessmentTitle, onSuccess }: CandidateAllocationProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [currentCandidate, setCurrentCandidate] = useState<Candidate>({ name: "", email: "" })
  const [isAllocating, setIsAllocating] = useState(false)
  const [allocationResults, setAllocationResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)
  const [open, setOpen] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const { toast } = useToast()

  const addCandidate = () => {
    if (!currentCandidate.name || !currentCandidate.email) {
      toast({
        title: "Missing Information",
        description: "Please enter both name and email for the candidate",
        variant: "destructive",
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(currentCandidate.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    // Check for duplicate emails
    if (candidates.some((c: Candidate) => c.email === currentCandidate.email)) {
      toast({
        title: "Duplicate Email",
        description: "This email is already in the candidate list",
        variant: "destructive",
      })
      return
    }

    setCandidates([...candidates, currentCandidate])
    setCurrentCandidate({ name: "", email: "" })
    
    toast({
      title: "Candidate Added",
      description: `${currentCandidate.name} has been added to the list`,
    })
  }

  const removeCandidate = (index: number) => {
    const removedCandidate = candidates[index]
    setCandidates(candidates.filter((_: any, i: number) => i !== index))
    
    toast({
      title: "Candidate Removed",
      description: `${removedCandidate.name} has been removed from the list`,
    })
  }

  const importFromCSV = (event: any) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImportError(null)
    
    const reader = new FileReader()
    reader.onload = (e: any) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n').filter(line => line.trim())
        
        if (lines.length < 2) {
          setImportError("CSV file must contain at least a header row and one data row")
          return
        }

        const newCandidates: Candidate[] = []
        const duplicates: string[] = []
        const invalid: string[] = []

        // Skip header row (index 0)
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim()
          if (!line) continue

          const [name, email] = line.split(',').map((s: string) => s.trim().replace(/"/g, ''))
          
          if (!name || !email) {
            invalid.push(`Row ${i + 1}: Missing name or email`)
            continue
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(email)) {
            invalid.push(`Row ${i + 1}: Invalid email format - ${email}`)
            continue
          }

          // Check for duplicates in existing candidates
          if (candidates.some(c => c.email === email) || newCandidates.some(c => c.email === email)) {
            duplicates.push(email)
            continue
          }

          newCandidates.push({ name, email })
        }

        if (invalid.length > 0) {
          setImportError(`Invalid entries found:\n${invalid.join('\n')}`)
        }

        if (duplicates.length > 0) {
          toast({
            title: "Duplicate Emails Skipped",
            description: `${duplicates.length} duplicate emails were skipped`,
            variant: "destructive",
          })
        }

        if (newCandidates.length > 0) {
          setCandidates((prev: any) => [...prev, ...newCandidates])
          toast({
            title: "Import Successful",
            description: `Added ${newCandidates.length} candidates from CSV`,
          })
        }
      } catch (error) {
        setImportError("Failed to parse CSV file. Please check the format.")
      }
    }
    reader.readAsText(file)
  }

  const allocateCandidates = async () => {
    if (candidates.length === 0) {
      toast({
        title: "No Candidates",
        description: "Please add at least one candidate to allocate",
        variant: "destructive",
      })
      return
    }

    setIsAllocating(true)
    try {
      console.log('Starting candidate allocation...')
      console.log('Assessment ID:', assessmentId)
      console.log('Candidates:', candidates)
      
      // Import auth functions dynamically to ensure they work in this component context
      const { getAuthToken } = await import('@/lib/auth')
      const token = getAuthToken()
      
      console.log('Auth token available:', !!token)
      console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'None')
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.')
      }
      
      // Make direct API call to allocate candidates (bypass candidatesApi wrapper)
      console.log('Making direct API call to allocate candidates...')
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const allocateUrl = `${API_URL}/admin/candidates/allocate`
      
      console.log('Allocation URL:', allocateUrl)
      
      const allocationResponse = await fetch(allocateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          assessmentId,
          candidates
        })
      })
      
      console.log('Allocation response status:', allocationResponse.status)
      
      if (!allocationResponse.ok) {
        const errorData = await allocationResponse.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || errorData.message || `HTTP ${allocationResponse.status}`)
      }
      
      const allocationData = await allocationResponse.json()
      console.log('Allocation response:', allocationData)

      if (!allocationData.success) {
        throw new Error(allocationData.error || 'Failed to allocate candidates')
      }

      // Then, create participants for each candidate using the working participantsApi
      console.log('Creating participants...')
      const participantPromises = candidates.map(async (candidate) => {
        try {
          const result = await participantsApi.create({
            name: candidate.name,
            email: candidate.email,
            tags: [`Assessment: ${assessmentTitle}`],
            assessmentIds: [assessmentId]
          })
          console.log('Participant created:', result)
          return result
        } catch (error) {
          console.error(`Failed to create participant for ${candidate.email}:`, error)
          return null
        }
      })

      const participantResults = await Promise.allSettled(participantPromises)
      const successfulParticipants = participantResults
        .filter(result => result.status === 'fulfilled' && result.value)
        .length

      console.log('Participant creation results:', participantResults)

      setAllocationResults(allocationData.candidates || [])
      setShowResults(true)
      setCandidates([])
      
      toast({
        title: "Allocation Successful",
        description: `${allocationData.candidates?.length || 0} candidates allocated, ${successfulParticipants} participants created, and emails sent`,
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error('Allocation error:', error)
      
      // Provide more specific error messages
      let errorMessage = error.message || "Failed to allocate candidates"
      
      if (error.message?.includes('401') || error.message?.includes('No token')) {
        errorMessage = "Authentication failed. Please log in again and try."
      } else if (error.message?.includes('404')) {
        errorMessage = "Service not available. Please contact support."
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = "Network error. Please check your connection and try again."
      }
      
      toast({
        title: "Allocation Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsAllocating(false)
    }
  }

  const downloadTemplate = () => {
    const csvContent = "Name,Email\nJohn Doe,john@example.com\nJane Smith,jane@example.com\nMike Johnson,mike@example.com"
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'candidate-template.csv'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    toast({
      title: "Template Downloaded",
      description: "CSV template has been downloaded to your computer",
    })
  }

  const copyCredentials = (candidateId: string, password: string) => {
    const text = `Candidate ID: ${candidateId}\nPassword: ${password}`
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Credentials Copied",
        description: "Login credentials copied to clipboard",
      })
    })
  }

  const exportResults = () => {
    if (allocationResults.length === 0) return

    const csvHeader = "Name,Email,Candidate ID,Password,Status\n"
    const csvContent = allocationResults.map(result => 
      `"${result.name}","${result.email}","${result.candidateId}","${result.password}","Email Sent"`
    ).join('\n')
    
    const blob = new Blob([csvHeader + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${assessmentTitle}-candidates-${new Date().toISOString().split('T')[0]}.csv`
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    toast({
      title: "Results Exported",
      description: "Candidate allocation results exported to CSV",
    })
  }

  const testApiConnection = async () => {
    try {
      console.log('=== DEBUGGING TOKEN RETRIEVAL ===')
      console.log('Testing API connection...')
      
      // Check all possible token sources
      console.log('localStorage.auth_token:', localStorage.getItem('auth_token'))
      console.log('localStorage.token:', localStorage.getItem('token'))
      console.log('document.cookie:', document.cookie)
      
      // Check what our auth function returns
      const { getAuthToken } = await import('@/lib/auth')
      const authToken = getAuthToken()
      console.log('getAuthToken() result:', authToken)
      
      // Check what our auth headers function returns
      const { getAuthHeaders } = await import('@/lib/auth')
      const authHeaders = getAuthHeaders()
      console.log('getAuthHeaders() result:', authHeaders)
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const url = `${API_URL}/admin/candidates/health`
      console.log('Test URL:', url)
      
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      console.log('Token available:', !!token)
      console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'None')
      
      // Check if token looks like a valid JWT
      if (token && !token.includes('.')) {
        console.error('Token does not look like a valid JWT (no dots found)')
        toast({
          title: "Authentication Issue",
          description: "❌ Invalid token format. Please log out and log in again.",
          variant: "destructive"
        })
        return
      }
      
      // Try using the auth headers function instead
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      if (authHeaders.Authorization) {
        headers.Authorization = authHeaders.Authorization
      }
      
      console.log('Final headers being sent:', headers)
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      })
      
      console.log('Health check response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Health check data:', data)
        toast({
          title: "API Connection Test",
          description: `✅ Connection successful! User: ${data.user?.email || 'Unknown'}`,
        })
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Health check failed:', errorData)
        
        if (response.status === 401) {
          toast({
            title: "Authentication Failed",
            description: `❌ Please log out and log in again. Error: ${errorData.message || 'Invalid token'}`,
            variant: "destructive"
          })
        } else {
          toast({
            title: "API Connection Test",
            description: `❌ Failed: ${errorData.error || errorData.message || response.statusText}`,
            variant: "destructive"
          })
        }
      }
    } catch (error) {
      console.error('Health check error:', error)
      toast({
        title: "API Connection Test",
        description: `❌ Network error: ${error}`,
        variant: "destructive"
      })
    }
  }

  const clearAuthAndReload = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('org_info')
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    
    toast({
      title: "Authentication Cleared",
      description: "Please refresh the page and log in again.",
    })
    
    // Redirect to login after a short delay
    setTimeout(() => {
      window.location.href = '/auth/login'
    }, 2000)
  }

  const testWorkingEndpoint = async () => {
    try {
      console.log('=== TESTING KNOWN WORKING ENDPOINT ===')
      const { getAuthHeaders } = await import('@/lib/auth')
      const authHeaders = getAuthHeaders()
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const url = `${API_URL}/auth/verify`
      console.log('Testing working endpoint:', url)
      console.log('Auth headers for working endpoint:', authHeaders)
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      if (authHeaders.Authorization) {
        headers.Authorization = authHeaders.Authorization
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      })
      
      console.log('Working endpoint response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Working endpoint data:', data)
        toast({
          title: "Working Endpoint Test",
          description: `✅ Auth/verify works! User: ${data.user?.email || 'Unknown'}`,
        })
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Working endpoint failed:', errorData)
        toast({
          title: "Working Endpoint Test",
          description: `❌ Even auth/verify failed: ${errorData.message || 'Unknown error'}`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Working endpoint test error:', error)
      toast({
        title: "Working Endpoint Test",
        description: `❌ Network error: ${error}`,
        variant: "destructive"
      })
    }
  }

  const testDirectApiCall = async () => {
    try {
      console.log('=== TESTING DIRECT API CALL ===')
      
      // Import auth functions
      const { getAuthToken } = await import('@/lib/auth')
      const token = getAuthToken()
      
      console.log('Direct test - Token available:', !!token)
      console.log('Direct test - Token preview:', token ? `${token.substring(0, 20)}...` : 'None')
      
      if (!token) {
        toast({
          title: "Direct API Test",
          description: "❌ No token available for direct test",
          variant: "destructive"
        })
        return
      }
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const url = `${API_URL}/admin/candidates/health`
      
      console.log('Direct test - URL:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('Direct test - Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Direct test - Success:', data)
        toast({
          title: "Direct API Test",
          description: `✅ Direct call worked! User: ${data.user?.email || 'Unknown'}`,
        })
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Direct test - Failed:', errorData)
        toast({
          title: "Direct API Test",
          description: `❌ Direct call failed: ${errorData.message || errorData.error}`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Direct test error:', error)
      toast({
        title: "Direct API Test",
        description: `❌ Error: ${error}`,
        variant: "destructive"
      })
    }
  }

  const testAllocateEndpoint = async () => {
    try {
      console.log('=== TESTING ALLOCATE ENDPOINT ===')
      
      // Import auth functions
      const { getAuthToken } = await import('@/lib/auth')
      const token = getAuthToken()
      
      console.log('Allocate test - Token available:', !!token)
      
      if (!token) {
        toast({
          title: "Allocate Endpoint Test",
          description: "❌ No token available",
          variant: "destructive"
        })
        return
      }
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const url = `${API_URL}/admin/candidates/allocate`
      
      console.log('Allocate test - URL:', url)
      
      // Test with empty candidates array to see if endpoint exists
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          assessmentId: 'test',
          candidates: []
        })
      })
      
      console.log('Allocate test - Response status:', response.status)
      
      const responseData = await response.json().catch(() => ({ error: 'No JSON response' }))
      console.log('Allocate test - Response data:', responseData)
      
      if (response.status === 404) {
        toast({
          title: "Allocate Endpoint Test",
          description: "❌ Allocate endpoint not found (404)",
          variant: "destructive"
        })
      } else if (response.status === 400) {
        // 400 is expected for invalid data, but means endpoint exists
        toast({
          title: "Allocate Endpoint Test",
          description: "✅ Allocate endpoint exists! (400 = validation error, which is expected)",
        })
      } else if (response.ok) {
        toast({
          title: "Allocate Endpoint Test",
          description: "✅ Allocate endpoint works!",
        })
      } else {
        toast({
          title: "Allocate Endpoint Test",
          description: `⚠️ Endpoint exists but returned ${response.status}: ${responseData.error || responseData.message}`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Allocate test error:', error)
      toast({
        title: "Allocate Endpoint Test",
        description: `❌ Error: ${error}`,
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-2xl primary-gradient glow-primary">
          <Users className="mr-2 h-4 w-4" />
          Allocate Candidates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Allocate Candidates</DialogTitle>
          <DialogDescription>
            Add candidates to the assessment "{assessmentTitle}" and send them login credentials.
            Candidates will also appear in the Participants section.
          </DialogDescription>
          {process.env.NODE_ENV === 'development' && (
            <div className="flex flex-wrap gap-2 mt-2">
              <Button 
                onClick={testWorkingEndpoint} 
                variant="outline" 
                size="sm" 
                className="rounded-xl text-green-600"
              >
                ✅ Test Working Endpoint
              </Button>
              <Button 
                onClick={testDirectApiCall} 
                variant="outline" 
                size="sm" 
                className="rounded-xl text-blue-600"
              >
                🎯 Direct API Test
              </Button>
              <Button 
                onClick={testApiConnection} 
                variant="outline" 
                size="sm" 
                className="rounded-xl"
              >
                🔧 Test API Connection
              </Button>
              <Button 
                onClick={clearAuthAndReload} 
                variant="outline" 
                size="sm" 
                className="rounded-xl text-red-600 hover:text-red-700"
              >
                🔄 Clear Auth & Reload
              </Button>
              <Button 
                onClick={testAllocateEndpoint} 
                variant="outline" 
                size="sm" 
                className="rounded-xl text-purple-600"
              >
                🎯 Test Allocate Endpoint
              </Button>
            </div>
          )}
        </DialogHeader>

        {!showResults ? (
          <div className="space-y-6">
            {/* Add Single Candidate */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Individual Candidate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={currentCandidate.name}
                      onChange={(e) => setCurrentCandidate(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter candidate name"
                      className="rounded-xl"
                      onKeyPress={(e) => e.key === 'Enter' && addCandidate()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={currentCandidate.email}
                      onChange={(e) => setCurrentCandidate(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter candidate email"
                      className="rounded-xl"
                      onKeyPress={(e) => e.key === 'Enter' && addCandidate()}
                    />
                  </div>
                </div>
                <Button 
                  onClick={addCandidate} 
                  className="rounded-xl"
                  disabled={!currentCandidate.name || !currentCandidate.email}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Candidate
                </Button>
              </CardContent>
            </Card>

            {/* Bulk Import */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Bulk Import from CSV
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={importFromCSV}
                      className="rounded-xl"
                    />
                  </div>
                  <Button onClick={downloadTemplate} variant="outline" className="rounded-xl">
                    <Download className="mr-2 h-4 w-4" />
                    Download Template
                  </Button>
                </div>
                
                {importError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="whitespace-pre-line">
                      {importError}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>CSV Format Requirements:</strong>
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• First row must be headers: Name,Email</li>
                    <li>• Each subsequent row: "John Doe","john@example.com"</li>
                    <li>• Email addresses must be valid and unique</li>
                    <li>• Maximum 100 candidates per import</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Candidate List */}
            {candidates.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Candidate List ({candidates.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {candidates.map((candidate, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-xl bg-muted/50"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{candidate.name}</p>
                          <p className="text-sm text-muted-foreground">{candidate.email}</p>
                        </div>
                        <Button
                          onClick={() => removeCandidate(index)}
                          variant="ghost"
                          size="sm"
                          className="rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  {candidates.length > 5 && (
                    <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200">
                      <p className="text-sm text-blue-700">
                        <strong>Tip:</strong> You can clear all candidates and start over, or proceed with allocation.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between">
              <div className="flex gap-2">
                <Button
                  onClick={() => setCandidates([])}
                  variant="outline"
                  className="rounded-xl"
                  disabled={candidates.length === 0}
                >
                  Clear All
                </Button>
                <Button
                  onClick={() => setOpen(false)}
                  variant="outline"
                  className="rounded-xl"
                >
                  Cancel
                </Button>
              </div>
              <Button
                onClick={allocateCandidates}
                disabled={isAllocating || candidates.length === 0}
                className="rounded-xl primary-gradient glow-primary"
              >
                {isAllocating ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Allocating...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Allocate {candidates.length} Candidate{candidates.length !== 1 ? 's' : ''} & Send Emails
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          // Results View
          <div className="space-y-6">
            <Alert>
              <Check className="h-4 w-4" />
              <AlertDescription>
                Successfully allocated {allocationResults.length} candidates, created participants, and sent login credentials!
                You can now view these candidates in the Participants section.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Allocation Results</CardTitle>
                <Button onClick={exportResults} variant="outline" className="rounded-xl">
                  <Download className="mr-2 h-4 w-4" />
                  Export Results
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Candidate ID</TableHead>
                        <TableHead>Password</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allocationResults.map((result, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{result.name}</TableCell>
                          <TableCell>{result.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {result.candidateId}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {result.password}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              <Mail className="mr-1 h-3 w-3" />
                              Email Sent
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={() => copyCredentials(result.candidateId, result.password)}
                              variant="ghost"
                              size="sm"
                              className="rounded-xl"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button
                onClick={() => {
                  setShowResults(false)
                  setAllocationResults([])
                }}
                variant="outline"
                className="rounded-xl"
              >
                Allocate More
              </Button>
              <Button
                onClick={() => {
                  setShowResults(false)
                  setAllocationResults([])
                  setOpen(false)
                }}
                className="rounded-xl"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}