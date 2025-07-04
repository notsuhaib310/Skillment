"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AssessmentManageRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new assessments page
    router.replace('/dashboard/assessments')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Redirecting to assessments...</p>
      </div>
    </div>
  )
} 