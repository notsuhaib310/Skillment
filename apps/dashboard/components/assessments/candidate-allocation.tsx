"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, X, Mail, Users, Send, Check, AlertCircle, Upload } from "lucide-react"
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
  }

  const removeCandidate = (index: number) => {
    setCandidates(candidates.filter((_: any, i: number) => i !== index))
  }

  const importFromCSV = (event: any) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e: any) => {
      const text = e.target?.result as string
      const lines = text.split('\n')
      const newCandidates: Candidate[] = []

      lines.forEach((line: string, index: number) => {
        if (index === 0) return // Skip header
        const [name, email] = line.split(',').map((s: string) => s.trim())
        if (name && email) {
          newCandidates.push({ name, email })
        }
      })

      setCandidates((prev: any) => [...prev, ...newCandidates])
      toast({
        title: "Import Successful",
        description: `Added ${newCandidates.length} candidates from CSV`,
      })
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
      const response = await fetch(`http://localhost:5000/api/admin/candidates/allocate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          assessmentId,
          candidates,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to allocate candidates')
      }

      setAllocationResults(data.candidates || [])
      setShowResults(true)
      setCandidates([])
      
      toast({
        title: "Allocation Successful",
        description: `${data.candidates?.length || 0} candidates allocated and emails sent`,
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      toast({
        title: "Allocation Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsAllocating(false)
    }
  }

  const downloadTemplate = () => {
    const csvContent = "Name,Email\nJohn Doe,john@example.com\nJane Smith,jane@example.com"
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'candidate-template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-2xl primary-gradient glow-primary">
          <Users className="mr-2 h-4 w-4" />
          Allocate Candidates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Allocate Candidates</DialogTitle>
          <DialogDescription>
            Add candidates to the assessment "{assessmentTitle}" and send them login credentials
          </DialogDescription>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={currentCandidate.name}
                      onChange={(e) => setCurrentCandidate(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter candidate name"
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={currentCandidate.email}
                      onChange={(e) => setCurrentCandidate(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter candidate email"
                      className="rounded-xl"
                    />
                  </div>
                </div>
                <Button onClick={addCandidate} className="rounded-xl">
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
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={importFromCSV}
                    className="rounded-xl"
                  />
                  <Button onClick={downloadTemplate} variant="outline" className="rounded-xl">
                    Download Template
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload a CSV file with Name and Email columns. The first row should be headers.
                </p>
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
                  <div className="space-y-3">
                    {candidates.map((candidate, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-xl bg-muted/50"
                      >
                        <div>
                          <p className="font-medium">{candidate.name}</p>
                          <p className="text-sm text-muted-foreground">{candidate.email}</p>
                        </div>
                        <Button
                          onClick={() => removeCandidate(index)}
                          variant="ghost"
                          size="sm"
                          className="rounded-xl text-red-500 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <Button
                onClick={() => setOpen(false)}
                variant="outline"
                className="rounded-xl"
              >
                Cancel
              </Button>
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
                    Allocate & Send Emails
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
                Successfully allocated {allocationResults.length} candidates and sent login credentials!
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Allocation Results</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Candidate ID</TableHead>
                      <TableHead>Password</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allocationResults.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell>{result.name}</TableCell>
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="flex justify-end">
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