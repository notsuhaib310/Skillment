'use client'
import { AssessmentDetailView } from "@/components/assessment-mange/assessment-detail-view"
import { useRouter, useParams } from "next/navigation"

export default function AssessmentDetail() {
  const router = useRouter()
  const params = useParams()
  const assessmentId = params?.assessmentId
  if (!assessmentId || Array.isArray(assessmentId)) return null
  return <AssessmentDetailView assessmentId={assessmentId} onBack={() => router.push('/dashboard/assessment-manage')} />
} 