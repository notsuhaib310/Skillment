"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { assessmentsApi, type Assessment } from "@/lib/api/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { AssessmentDetailView } from "@/components/assessments/assessment-detail-view"

export default function ManageAssessmentPage() {
  const router = useRouter()
  const params = useParams()
  const assessmentId = params?.assessmentId as string
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!assessmentId) return
    setLoading(true)
    assessmentsApi.getById(assessmentId)
      .then(setAssessment)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [assessmentId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading assessment...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="max-w-xl mx-auto mt-12">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => router.back()}>Back</Button>
        </CardContent>
      </Card>
    )
  }

  if (!assessment) {
    return (
      <Card className="max-w-xl mx-auto mt-12">
        <CardHeader>
          <CardTitle>Assessment Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.back()}>Back</Button>
        </CardContent>
      </Card>
    )
  }

  // If AssessmentDetailView exists, use it for rich display
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push("/dashboard/assessments")}>Back to Assessments</Button>
      </div>
      <AssessmentDetailView assessmentId={assessmentId} onBack={() => router.push("/dashboard/assessments")}/>
    </div>
  )
} 