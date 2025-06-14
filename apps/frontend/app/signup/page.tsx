"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { registerUser } from "../actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Eye, EyeOff, User, Building2 } from "lucide-react"

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3001"

export default function SignUpPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const result = await registerUser(formData)

      if (!result.success) {
        setError(result.error || "Registration failed")
        return
      }

      // Redirect to dashboard app on port 3001
      window.location.href = `${DASHBOARD_URL}/dashboard`
    } catch (error: any) {
      setError(error.message || "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Enhanced Professional Brand Section */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 border border-blue-400/20 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-32 w-24 h-24 border border-blue-400/20 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-32 w-16 h-16 border border-blue-400/20 rounded-full animate-pulse delay-500"></div>
          <div className="absolute bottom-20 right-20 w-20 h-20 border border-blue-400/20 rounded-full animate-pulse delay-700"></div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-500/5 to-transparent"></div>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.1) 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        <div className="relative z-10 flex flex-col justify-between px-12 py-16 text-white w-full">
          {/* Logo Section */}
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-3xl font-bold">TalentHub</span>
              <p className="text-blue-200 text-sm">AI-Powered Talent Platform</p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col justify-center space-y-8">
            {/* Hero Text */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight">
                Transform Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  Hiring Process
                </span>
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                Join 1000+ companies using AI-powered assessments to find the perfect talent
              </p>
            </div>

            {/* Feature Cards */}
            <div className="space-y-4">
              {/* Main Feature Card */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Assessments</h3>
                    <p className="text-blue-100 text-sm leading-relaxed">
                      Advanced proctoring with real-time monitoring and intelligent analysis
                    </p>
                  </div>
                </div>

                {/* Mini Dashboard Preview */}
                <div className="mt-4 bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-blue-200">Live Assessment</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-400">Active</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-200">Candidates</span>
                      <span className="text-white font-medium">247</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1">
                      <div className="bg-gradient-to-r from-blue-400 to-cyan-400 h-1 rounded-full w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Pills */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-white">Eye Tracking</span>
                  </div>
                  <p className="text-xs text-blue-200">Advanced monitoring</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-white">Instant Results</span>
                  </div>
                  <p className="text-xs text-blue-200">Real-time feedback</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">98%</div>
              <div className="text-xs text-blue-200">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">1000+</div>
              <div className="text-xs text-blue-200">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">2.5s</div>
              <div className="text-xs text-blue-200">Response</div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 right-8 w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-300"></div>
        <div className="absolute bottom-1/3 right-16 w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-700"></div>
        <div className="absolute top-1/2 right-4 w-1 h-1 bg-white rounded-full animate-pulse"></div>
      </div>

      {/* Right Panel - Form Section */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-3">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">Sign up as recruiter</h1>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                  First Name<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="h-12 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 bg-white"
                  placeholder="First Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="h-12 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 bg-white"
                  placeholder="Last Name"
                />
              </div>
            </div>

            {/* Organization Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Organisation Email<span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="h-12 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 bg-white"
                placeholder="Official Email"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Phone<span className="text-red-500">*</span>
              </Label>
              <div className="flex">
                <Select defaultValue="+91">
                  <SelectTrigger className="w-20 h-12 border-gray-200 rounded-l-lg border-r-0 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+91">+91</SelectItem>
                    <SelectItem value="+1">+1</SelectItem>
                    <SelectItem value="+44">+44</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="flex-1 h-12 border-gray-200 rounded-r-lg border-l-0 focus:border-blue-500 focus:ring-blue-500 bg-white"
                  placeholder="Phone Number"
                />
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">
                Gender<span className="text-red-500">*</span>
              </Label>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    required
                  />
                  <span className="text-sm text-gray-700">Male</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    required
                  />
                  <span className="text-sm text-gray-700">Female</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="other"
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    required
                  />
                  <span className="text-sm text-gray-700">More Options</span>
                </label>
              </div>
            </div>

            {/* Organization Name */}
            <div className="space-y-2">
              <Label htmlFor="orgName" className="text-sm font-medium text-gray-700">
                Organization Name<span className="text-red-500">*</span>
              </Label>
              <Input
                id="orgName"
                name="orgName"
                type="text"
                required
                className="h-12 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 bg-white"
                placeholder="Organization Name"
              />
            </div>

            {/* Organization Type */}
            <div className="space-y-2">
              <Label htmlFor="orgType" className="text-sm font-medium text-gray-700">
                Organization Type<span className="text-red-500">*</span>
              </Label>
              <Select name="orgType" required>
                <SelectTrigger className="h-12 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 bg-white">
                  <SelectValue placeholder="Select organization type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="startup">Startup</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                  <SelectItem value="agency">Agency</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Organization Size */}
            <div className="space-y-2">
              <Label htmlFor="orgSize" className="text-sm font-medium text-gray-700">
                Organization Size<span className="text-red-500">*</span>
              </Label>
              <Select name="orgSize" required>
                <SelectTrigger className="h-12 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 bg-white">
                  <SelectValue placeholder="Select organization size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-500">201-500 employees</SelectItem>
                  <SelectItem value="501+">501+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password<span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="h-12 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 bg-white pr-10"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password<span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    className="h-12 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 bg-white pr-10"
                    placeholder="Confirm Password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox id="terms" className="mt-1" />
                <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                  All your information is collected, stored and processed as per our{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    data processing guidelines
                  </a>
                  . By signing up on TalentHub, you agree to our{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    Terms of Use
                  </a>
                </Label>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox id="newsletter" className="mt-1" />
                <Label htmlFor="newsletter" className="text-sm text-gray-600">
                  Stay in the loop – Get relevant updates curated just for <em>you!</em>
                </Label>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-6">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <a href="/login" className="text-blue-600 hover:underline font-medium">
                  Login
                </a>
              </p>
              <Button
                type="submit"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Next"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Floating Profile Images (Background Decoration) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-8 right-8 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-blue-600" />
        </div>
        <div className="absolute top-32 right-32 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-green-600" />
        </div>
        <div className="absolute top-48 right-16 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-purple-600" />
        </div>
        <div className="absolute bottom-32 right-24 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-orange-600" />
        </div>
        <div className="absolute bottom-16 right-8 w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-pink-600" />
        </div>
      </div>
    </div>
  )
}
