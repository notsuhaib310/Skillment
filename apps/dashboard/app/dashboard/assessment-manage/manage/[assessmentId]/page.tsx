'use client'
import { ManageCandidatesPage } from "@/components/assessment-mange/manage-candidates-page"
import { useRouter, useParams } from "next/navigation"

export default function AssessmentManageDetail() {
  const router = useRouter()
  const params = useParams()
  const assessmentId = params?.assessmentId
  if (!assessmentId || Array.isArray(assessmentId)) return null
  return <ManageCandidatesPage assessmentId={assessmentId} onBack={() => router.push('/dashboard/assessment-manage')} />
} 