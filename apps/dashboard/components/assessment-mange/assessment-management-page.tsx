"use client"

import { useState } from "react"
import { AssessmentOverview } from "./assessment-overview"
import { CreateAssessmentPage } from "./create-assessment-page"

export function AssessmentManagementPage() {
  const [currentView, setCurrentView] = useState<"overview" | "create">("overview")

  const handleCreateNew = () => {
    setCurrentView("create")
  }

  const handleBackToOverview = () => {
    setCurrentView("overview")
  }

  if (currentView === "create") {
    return <CreateAssessmentPage onBack={handleBackToOverview} />
  }

  return <AssessmentOverview onCreateNew={handleCreateNew} />
}
