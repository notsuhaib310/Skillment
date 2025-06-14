"use client"
import { useState, useEffect } from "react"
import type React from "react"
import { cn } from "@/lib/utils"
import { ArrowRight, Lock, Mail, User, Building, AlertCircle } from "lucide-react"
import { AnimatedButton } from "@/components/ui/aceternity/animated-button"
import { loginUser } from "@/app/actions/auth"
import { useRouter, useSearchParams } from "next/navigation"

export const LoginForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<"student" | "organization">("student")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check for error message in URL params
  useEffect(() => {
    const message = searchParams.get("message")
    if (message) {
      setError(decodeURIComponent(message))
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("password", password)
      formData.append("rememberMe", rememberMe ? "on" : "off")
      formData.append("userType", activeTab)

      const result = await loginUser(formData)

      if (result.success) {
        // Redirect to dashboard app
        window.location.href = "http://localhost:3001/dashboard"
      } else {
        setError(result.message || "Login failed")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-2xl p-8 w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-gray-400">Sign in to your Skillment account</p>
      </div>

      {/* Tab Selector */}
      <div className="flex mb-8">
        <button
          className={cn(
            "flex-1 py-3 text-center rounded-l-lg transition-all duration-300",
            activeTab === "student"
              ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
              : "bg-white/5 text-gray-400 hover:text-white",
          )}
          onClick={() => setActiveTab("student")}
        >
          <div className="flex items-center justify-center">
            <User className="w-4 h-4 mr-2" />
            <span>Student/Candidate</span>
          </div>
        </button>
        <button
          className={cn(
            "flex-1 py-3 text-center rounded-r-lg transition-all duration-300",
            activeTab === "organization"
              ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
              : "bg-white/5 text-gray-400 hover:text-white",
          )}
          onClick={() => setActiveTab("organization")}
        >
          <div className="flex items-center justify-center">
            <Building className="w-4 h-4 mr-2" />
            <span>Organization</span>
          </div>
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              placeholder="your@email.com"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <a href="/forgot-password" className="text-sm text-orange-400 hover:text-orange-300">
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="remember-me"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-white/10 bg-black/50 text-orange-500 focus:ring-orange-500/50"
            disabled={isLoading}
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
            Remember me
          </label>
        </div>

        <AnimatedButton
          type="submit"
          colors={["#ea580c", "#dc2626", "#be185d"]}
          className="w-full py-3 text-lg group"
          disabled={isLoading}
        >
          {isLoading ? "Signing In..." : "Sign In"}
          {!isLoading && <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
        </AnimatedButton>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-400">
          Don't have an account?{" "}
          <a href="/signup" className="text-orange-400 hover:text-orange-300">
            Sign up
          </a>
        </p>
      </div>

      {/* Social Login */}
      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-zinc-900 text-gray-400">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button
            type="button"
            className="w-full flex items-center justify-center px-4 py-2 border border-white/10 rounded-lg text-gray-300 hover:bg-white/5 transition-colors"
            disabled={isLoading}
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>
          <button
            type="button"
            className="w-full flex items-center justify-center px-4 py-2 border border-white/10 rounded-lg text-gray-300 hover:bg-white/5 transition-colors"
            disabled={isLoading}
          >
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.14 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z"
                clipRule="evenodd"
              />
            </svg>
            GitHub
          </button>
        </div>
      </div>
    </div>
  )
}
