'use client'
import { ResultsPage } from "@/components/assessment-mange/results-page"
import { useRouter, useParams } from "next/navigation"

export default function AssessmentResults() {
  const router = useRouter()
  const params = useParams()
  const assessmentId = params?.assessmentId
  if (!assessmentId || Array.isArray(assessmentId)) return null
  return <ResultsPage assessmentId={assessmentId} onBack={() => router.push('/dashboard/assessment-manage')} />
} 