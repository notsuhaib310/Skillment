"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Building2, ArrowRight, CheckCircle, XCircle, Loader2, Sparkles } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface OrgLoginModalProps {
  isOpen: boolean
  onClose: () => void
}

type CheckStatus = "idle" | "checking" | "available" | "unavailable" | "error"

export const OrgLoginModal = ({ isOpen, onClose }: OrgLoginModalProps) => {
  const [orgName, setOrgName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [checkStatus, setCheckStatus] = useState<CheckStatus>("idle")
  const [debouncedOrgName, setDebouncedOrgName] = useState("")

  // Debounce organization name input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedOrgName(orgName.trim().toLowerCase())
    }, 500)

    return () => clearTimeout(timer)
  }, [orgName])

  // Check organization availability when debounced org name changes
  useEffect(() => {
    const checkOrgAvailability = async () => {
      if (!debouncedOrgName) {
        setCheckStatus("idle")
        return
      }

      setCheckStatus("checking")

      try {
        // Simulate API call - replace with actual endpoint
        await new Promise((resolve) => setTimeout(resolve, 800))

        // For demo purposes, consider any org name as available
        // Replace this logic with your actual API call
        const isAvailable = debouncedOrgName.length >= 3
        setCheckStatus(isAvailable ? "available" : "unavailable")
      } catch (error) {
        console.error("Error checking organization:", error)
        setCheckStatus("error")
      }
    }

    checkOrgAvailability()
  }, [debouncedOrgName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgName.trim() || checkStatus !== "available") return

    setIsLoading(true)

    try {
      // Redirect to the organization's subdomain
      window.location.href = `https://${orgName.trim().toLowerCase()}.skillment.in`
    } catch (error) {
      console.error("Error redirecting:", error)
      setCheckStatus("error")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = () => {
    switch (checkStatus) {
      case "checking":
        return <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
      case "available":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />
      case "unavailable":
        return <XCircle className="w-4 h-4 text-amber-400" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return null
    }
  }

  const getStatusMessage = () => {
    switch (checkStatus) {
      case "checking":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center text-blue-400 text-sm"
          >
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Verifying workspace...
          </motion.div>
        )
      case "available":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center text-emerald-400 text-sm"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            <span>
              Ready to connect to <span className="font-semibold">{orgName}.skillment.in</span>
            </span>
          </motion.div>
        )
      case "unavailable":
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="flex items-center text-amber-400 text-sm">
              <XCircle className="w-4 h-4 mr-2" />
              Workspace not found
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full text-amber-400 border-amber-400/30 hover:bg-amber-500/10 hover:border-amber-400/50 transition-all duration-200"
              onClick={() => window.open("https://app.skillment.in/signup", "_blank")}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Create {orgName}.skillment.in workspace
            </Button>
          </motion.div>
        )
      case "error":
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm">
            Connection failed. Please try again.
          </motion.div>
        )
      default:
        return <div className="text-slate-400 text-xs">Enter your organization name to continue</div>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-black/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl">
        <DialogHeader className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg"
          >
            <Building2 className="w-8 h-8 text-white" />
          </motion.div>

          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Access Your Workspace
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-base">
            Enter your organization URL to sign in to your Skillment workspace
          </DialogDescription>
        </DialogHeader>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6 mt-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="space-y-3">
            <label htmlFor="orgName" className="text-sm font-medium text-slate-300 block">
              Organization URL
            </label>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <span className="text-slate-400 font-mono text-sm">https://</span>
              </div>

              <Input
                id="orgName"
                type="text"
                value={orgName}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase()
                  setOrgName(value)
                }}
                className={cn(
                  "w-full bg-slate-800/50 border-2 border-slate-600/50 rounded-xl pl-[88px] pr-[140px] py-4 text-white placeholder:text-slate-500 font-mono text-sm transition-all duration-200",
                  "focus:outline-none focus:ring-0 focus:border-orange-500/50 focus:bg-slate-800/70",
                  "group-hover:border-slate-500/70",
                  checkStatus === "available" && "border-emerald-500/50 bg-emerald-950/20",
                  checkStatus === "unavailable" && "border-amber-500/50 bg-amber-950/20",
                  checkStatus === "error" && "border-red-500/50 bg-red-950/20",
                )}
                placeholder="your-company"
                required
                disabled={isLoading}
                autoComplete="off"
                spellCheck={false}
              />

              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <div className="flex items-center space-x-2">
                  {getStatusIcon()}
                  <span className="text-slate-400 font-mono text-sm">.skillment.in</span>
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={checkStatus}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="min-h-[20px] flex items-start"
              >
                {getStatusMessage()}
              </motion.div>
            </AnimatePresence>
          </div>

          <Button
            type="submit"
            className={cn(
              "w-full py-4 text-base font-semibold rounded-xl transition-all duration-200 group",
              "bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700",
              "shadow-lg hover:shadow-xl hover:shadow-orange-500/25",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg",
              checkStatus === "available" && "ring-2 ring-emerald-400/30 hover:ring-emerald-400/50",
            )}
            disabled={isLoading || checkStatus !== "available"}
          >
            {isLoading ? (
              <motion.div
                className="flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Connecting...
              </motion.div>
            ) : (
              <motion.div
                className="flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue to {orgName ? `${orgName}.skillment.in` : "workspace"}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </motion.div>
            )}
          </Button>
        </motion.form>

        <motion.div
          className="text-center text-sm text-slate-400 pt-4 border-t border-slate-700/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Don't have a workspace?{" "}
          <a
            href="https://skillment.in/signup"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-400 hover:text-orange-300 underline underline-offset-4 transition-colors duration-200 font-medium"
          >
            Create one for free
          </a>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
