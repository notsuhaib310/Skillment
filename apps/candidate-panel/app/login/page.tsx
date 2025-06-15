"use client"

import { useRouter } from "next/navigation"
import CandidateLogin from "@/components/candidate-login"

export default function LoginPage() {
  const router = useRouter()

  const handleLoginSuccess = (data: any) => {
    // Store candidate data in sessionStorage for access across routes
    sessionStorage.setItem("candidateData", JSON.stringify(data))
    router.push("/system-checks")
  }

  return <CandidateLogin onSuccess={handleLoginSuccess} />
}
