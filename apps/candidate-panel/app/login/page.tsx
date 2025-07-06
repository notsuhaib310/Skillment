"use client"

import { useRouter } from "next/navigation"
import CandidateLogin from "@/components/candidate-login"

export default function LoginPage() {
  const router = useRouter()

  const handleLoginSuccess = (data: any) => {
    // Store candidate data in sessionStorage for access across routes
    sessionStorage.setItem("candidateData", JSON.stringify(data))
    // Redirect to dashboard to show available assessments
    router.push("/dashboard")
  }

  return <CandidateLogin onSuccess={handleLoginSuccess} />
}
