"use client"

import { useEffect } from "react"
import { Shield, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ErrorPage() {
  const hostname = typeof window !== "undefined" ? window.location.hostname : ""
  const subdomain = hostname.split(".")[0]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
            <Shield className="w-10 h-10 text-white" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">Organization Not Found</h1>
            <p className="text-white/80">
              The organization <span className="font-semibold">{subdomain}</span> does not exist or you don't have access to it.
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => window.location.href = "https://skillment.in"}
              className="w-full bg-white text-orange-600 hover:bg-white/90"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Homepage
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 