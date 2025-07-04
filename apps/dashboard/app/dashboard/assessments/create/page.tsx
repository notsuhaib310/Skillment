"use client"

import { useRouter } from "next/navigation"
import { CreateAssessmentPage } from "@/components/assessments/create-assessment-page"

export default function CreateAssessmentPageRoute() {
  const router = useRouter()

  const handleBack = () => {
    router.push('/dashboard/assessments')
  }

  return <CreateAssessmentPage onBack={handleBack} />
}