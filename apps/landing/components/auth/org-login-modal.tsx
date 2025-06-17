"use client"

import { useState } from "react"
import { Building, ArrowRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { AnimatedButton } from "@/components/ui/aceternity/animated-button"

interface OrgLoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export const OrgLoginModal = ({ isOpen, onClose }: OrgLoginModalProps) => {
  const [orgName, setOrgName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Here you would typically validate the org name and redirect
      // For now, we'll just simulate a delay and redirect
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect to dashboard with org name
      const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3001/dashboard"
      window.location.href = `${dashboardUrl}?org=${encodeURIComponent(orgName)}`
    } catch (error) {
      console.error("Error during login:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-zinc-900/95 backdrop-blur-sm border border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white text-center">
            Welcome to Skillment
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <label htmlFor="orgName" className="text-sm font-medium text-gray-300">
              Organization Name
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="orgName"
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                placeholder="Enter your organization name"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <AnimatedButton
            type="submit"
            colors={["#ea580c", "#dc2626", "#be185d"]}
            className="w-full py-3 text-lg group"
            disabled={isLoading}
          >
            {isLoading ? "Redirecting..." : "Continue to Workspace"}
            {!isLoading && <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </AnimatedButton>
        </form>
      </DialogContent>
    </Dialog>
  )
} 