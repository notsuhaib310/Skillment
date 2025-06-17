"use client"

import type React from "react"
import { useState } from "react"
import { toast } from "sonner"
import { Eye, EyeOff, Shield, BarChart3, Users, Calendar, Award, TrendingUp, Target } from "lucide-react"
import { useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.skillment.in/api"

// Floating elements data
const floatingElements = [
  { id: 1, position: "top-16 left-16", icon: BarChart3, color: "bg-blue-500", delay: "0s" },
  { id: 2, position: "top-32 right-24", icon: Users, color: "bg-green-500", delay: "0.5s" },
  { id: 3, position: "top-64 left-32", icon: Calendar, color: "bg-purple-500", delay: "1s" },
  { id: 4, position: "bottom-32 left-24", icon: Award, color: "bg-yellow-500", delay: "1.5s" },
  { id: 5, position: "bottom-20 right-32", icon: TrendingUp, color: "bg-red-500", delay: "2s" },
  { id: 6, position: "top-1/2 left-12", icon: Target, color: "bg-indigo-500", delay: "2.5s" },
]

const rightFloatingAvatars = [
  { id: 1, position: "top-20 left-20", size: "w-8 h-8" },
  { id: 2, position: "top-40 right-16", size: "w-6 h-6" },
  { id: 3, position: "bottom-32 left-16", size: "w-10 h-10" },
  { id: 4, position: "bottom-20 right-24", size: "w-8 h-8" },
]

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginType, setLoginType] = useState<"email" | "uniqueId">("email")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      // Get the current hostname
      const hostname = window.location.hostname
      const subdomain = hostname.split(".")[0]
      
      // Redirect to the dashboard on the same subdomain
      window.location.href = `https://${subdomain}.skillment.in/dashboard`
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Enhanced Hero Section */}
      <div className="flex-1 relative bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fillRule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fillOpacity=&quot;0.1&quot;%3E%3Ccircle cx=&quot;7&quot; cy=&quot;7&quot; r=&quot;7&quot;/%3E%3Ccircle cx=&quot;53&quot; cy=&quot;7&quot; r=&quot;7&quot;/%3E%3Ccircle cx=&quot;7&quot; cy=&quot;53&quot; r=&quot;7&quot;/%3E%3Ccircle cx=&quot;53&quot; cy=&quot;53&quot; r=&quot;7&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        </div>

        {/* Floating Icons */}
        {floatingElements.map((element) => {
          const IconComponent = element.icon
          return (
            <div
              key={element.id}
              className={`absolute ${element.position} w-12 h-12 ${element.color} rounded-2xl flex items-center justify-center shadow-lg animate-bounce`}
              style={{
                animationDelay: element.delay,
                animationDuration: "3s",
              }}
            >
              <IconComponent className="w-6 h-6 text-white" />
            </div>
          )
        })}

        {/* Main Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Logo */}
          <div className="p-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Skillment</h1>
                <p className="text-white/80 text-sm">Event Management Platform</p>
              </div>
            </div>
          </div>

          {/* Central Content */}
          <div className="flex-1 flex items-center justify-center px-8">
            <div className="max-w-lg text-center space-y-8">
              {/* Main Illustration */}
              <div className="relative">
                <div className="w-80 h-80 mx-auto bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                  <div className="w-64 h-64 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-48 h-48 bg-white/30 rounded-full flex items-center justify-center">
                      <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl">
                        <Shield className="w-16 h-16 text-orange-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Orbiting Elements */}
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div
                  className="absolute bottom-8 left-8 w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-xl animate-pulse"
                  style={{ animationDelay: "1s" }}
                >
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div
                  className="absolute bottom-8 right-8 w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center shadow-xl animate-pulse"
                  style={{ animationDelay: "2s" }}
                >
                  <Calendar className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Hero Text */}
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-white leading-tight">
                  Manage Events
                  <br />
                  <span className="text-white/90">Like Never Before</span>
                </h2>
                <p className="text-xl text-white/80 leading-relaxed">
                  Powerful tools to organize, track, and analyze your events with comprehensive participant management
                </p>
              </div>

              {/* Feature Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">1000+</div>
                  <div className="text-white/80 text-sm">Events Managed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">50K+</div>
                  <div className="text-white/80 text-sm">Participants</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">99%</div>
                  <div className="text-white/80 text-sm">Success Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center p-8 relative">
        {/* Floating Avatars for Right Side */}
        {rightFloatingAvatars.map((avatar) => (
          <div
            key={`right-${avatar.id}`}
            className={`absolute ${avatar.position} ${avatar.size} rounded-full bg-gray-200 flex items-center justify-center animate-pulse`}
            style={{
              animationDelay: `${avatar.id * 0.7}s`,
              animationDuration: "4s",
            }}
          >
            <div
              className={`${avatar.size === "w-10 h-10" ? "w-6 h-6" : avatar.size === "w-8 h-8" ? "w-4 h-4" : "w-3 h-3"} rounded-full bg-gray-300`}
            ></div>
          </div>
        ))}

        <div className="w-full max-w-md relative z-10">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">Log in</h2>
            </div>

            {/* Login Type Toggle */}
            <div className="flex bg-gray-200 rounded-full p-1">
              <button
                onClick={() => setLoginType("email")}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
                  loginType === "email" ? "bg-gray-800 text-white" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                From Email
              </button>
              <button
                onClick={() => setLoginType("uniqueId")}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
                  loginType === "uniqueId" ? "bg-gray-800 text-white" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                From Unique ID
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  type={loginType === "email" ? "email" : "text"}
                  placeholder={loginType === "email" ? "Email Address" : "Unique ID"}
                  required
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Your Password"
                  required
                  className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="text-right">
                <a href="#" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
