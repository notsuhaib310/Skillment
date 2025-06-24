"use client"

import { useState } from "react"
import { AssessmentOverview } from "./assessment-overview"
import { CreateAssessmentPage } from "./create-assessment-page"
import { useRouter } from "next/navigation"

export function AssessmentManagementPage() {
  const [currentView, setCurrentView] = useState<"overview" | "create">("overview")
  const router = useRouter()

  const handleCreateNew = () => {
    setCurrentView("create")
  }

  const handleBackToOverview = () => {
    setCurrentView("overview")
  }

  const handleManageCandidates = (assessmentId: string) => {
    router.push(`/dashboard/assessment-manage/${assessmentId}`)
  }

  const handleViewResults = (assessmentId: string) => {
    router.push(`/dashboard/assessment-manage/results/${assessmentId}`)
  }

  const handleViewDetails = (assessmentId: string) => {
    router.push(`/dashboard/assessment-manage/detail/${assessmentId}`)
  }

  if (currentView === "create") {
    return <CreateAssessmentPage onBack={handleBackToOverview} />
  }

  return <AssessmentOverview onCreateNew={handleCreateNew} />
}
