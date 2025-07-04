"use client"

import { AssessmentManagePage } from "@/components/assessments/assessment-manage-page"

interface PageProps {
  params: {
    id: string
  }
}

export default function AssessmentManagePageRoute({ params }: PageProps) {
  return <AssessmentManagePage assessmentId={params.id} />
}