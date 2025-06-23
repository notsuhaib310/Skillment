"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Shield,
  Check,
  User,
  Building2,
  Lock,
  FileText,
  CheckCircle,
  XCircle,
  Search,
  Settings,
  Sparkles,
  Zap,
  Globe,
  Crown,
  Star,
  Infinity,
  RefreshCw,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

const steps = [
  { id: 1, title: "Personal Info", icon: User, description: "Basic information about you" },
  { id: 2, title: "Organization", icon: Building2, description: "Your company details" },
  { id: 3, title: "Security", icon: Lock, description: "Create your account password" },
  { id: 4, title: "Plan Selection", icon: Crown, description: "Choose your subscription plan" },
  { id: 5, title: "Terms", icon: FileText, description: "Review and accept terms" },
]

// Floating particles component
const FloatingParticles = () => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; size: number }>>(
    [],
  )

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 20,
      size: Math.random() * 3 + 1,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animation: `float ${15 + Math.random() * 10}s infinite linear`,
          }}
        />
      ))}
    </div>
  )
}

export default function SignUpPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [paymentRetryCount, setPaymentRetryCount] = useState(0)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    password: "",
    confirmPassword: "",
    orgName: "",
    orgType: "",
    orgSize: "",
    termsAccepted: false,
    newsletterOptIn: false,
    plan: "free",
  })
  const [orgValidation, setOrgValidation] = useState<{
    isValid: boolean | null
    message: string
    isChecking: boolean
  }>({
    isValid: null,
    message: "",
    isChecking: false,
  })

  const [showLoginPopup, setShowLoginPopup] = useState(false)
  const [loginOrgName, setLoginOrgName] = useState("")
  const [loginOrgStatus, setLoginOrgStatus] = useState<{
    exists: boolean | null
    message: string
    isChecking: boolean
  }>({
    exists: null,
    message: "",
    isChecking: false,
  })

  const [razorpaySubscriptionId, setRazorpaySubscriptionId] = useState<string | null>(null)
  const [razorpayPaymentId, setRazorpayPaymentId] = useState<string | null>(null)
  const [razorpaySignature, setRazorpaySignature] = useState<string | null>(null)
  const [phoneNumber, setPhoneNumber] = useState<string>("")

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => {
        resolve(true)
      }
      script.onerror = () => {
        resolve(false)
      }
      document.body.appendChild(script)
    })
  }

  const handleCheckOrgName = async () => {
    if (!formData.orgName) {
      setOrgValidation({ isValid: null, message: "Please enter an organization name", isChecking: false })
      return
    }

    setOrgValidation((prev) => ({ ...prev, isChecking: true, isValid: null, message: "Checking availability..." }))

    try {
      const response = await fetch(`${API_URL}/organizations/validate/${formData.orgName}`)
      const data = await response.json()

      if (response.ok) {
        setOrgValidation({
          isValid: data.available,
          message: data.message,
          isChecking: false,
        })
      } else {
        setOrgValidation({
          isValid: false,
          message: data.error || "Failed to validate organization name",
          isChecking: false,
        })
      }
    } catch (error) {
      setOrgValidation({
        isValid: false,
        message: "An error occurred while checking. Please try again.",
        isChecking: false,
      })
    }
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Personal info
        return !!(
          formData.firstName &&
          formData.lastName &&
          formData.email &&
          phoneNumber &&
          phoneNumber.length >= 8 &&
          formData.gender
        )
      case 2: // Organization
        return !!(formData.orgName && formData.orgType && formData.orgSize && orgValidation.isValid === true)
      case 3: // Security
        return !!(
          formData.password &&
          formData.password.length >= 8 &&
          formData.confirmPassword &&
          formData.password === formData.confirmPassword
        )
      case 4: // Plan Selection
        return !!formData.plan
      case 5: // Terms
        return formData.termsAccepted
      default:
        return false
    }
  }

  const nextStep = async () => {
    setError(null)

    if (validateStep(currentStep)) {
      setCurrentStep(Math.min(currentStep + 1, steps.length))
    } else {
      if (currentStep === 1) {
        setError("Please fill in all personal information fields correctly")
      } else if (currentStep === 2 && orgValidation.isValid === false) {
        setError(orgValidation.message || "Please enter a valid and available organization name.")
      } else if (currentStep === 2) {
        setError("Please complete all organization details and verify your organization name")
      } else if (currentStep === 3) {
        if (!formData.password) {
          setError("Please enter a password")
        } else if (formData.password.length < 8) {
          setError("Password must be at least 8 characters long")
        } else if (!formData.confirmPassword) {
          setError("Please confirm your password")
        } else if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match")
        } else {
          setError("Please create a valid password")
        }
      } else if (currentStep === 4) {
        setError("Please select a plan")
      } else if (currentStep === 5) {
        setError("Please accept the terms and conditions")
      } else {
        setError("Please fill in all required fields")
      }
    }
  }

  const prevStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 1))
    setError(null)
  }

  const handleEliteSubscription = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await loadRazorpayScript()

      // Create subscription from backend
      const subscriptionRes = await fetch(`${API_URL}/auth/razorpay/elite-subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail: formData.email,
          customerName: `${formData.firstName} ${formData.lastName}`,
          customerPhone: phoneNumber,
        }),
      })

      if (!subscriptionRes.ok) {
        throw new Error("Failed to create subscription")
      }

      const { subscription } = await subscriptionRes.json()

      return new Promise((resolve, reject) => {
        const rzp = new (window as any).Razorpay({
          key: "rzp_test_67rfnHSNSueMW8",
          subscription_id: subscription.id,
          name: "Skillment Elite Subscription",
          description: "Elite Plan - ₹999/month",
          handler: (response: any) => {
            setRazorpaySubscriptionId(response.razorpay_subscription_id)
            setRazorpayPaymentId(response.razorpay_payment_id)
            setRazorpaySignature(response.razorpay_signature)
            toast.success("Subscription activated successfully!")
            resolve(true)
          },
          prefill: {
            email: formData.email,
            name: `${formData.firstName} ${formData.lastName}`,
            contact: phoneNumber,
          },
          theme: { color: "#ea580c" },
          modal: {
            ondismiss: () => {
              setIsLoading(false)
              reject(new Error("Payment cancelled"))
            },
          },
        })

        rzp.on("payment.failed", (response: any) => {
          setPaymentRetryCount((prev) => prev + 1)
          setError(`Payment failed: ${response.error.description}. Please try again.`)
          setIsLoading(false)
          reject(new Error("Payment failed"))
        })

        rzp.open()
      })
    } catch (error: any) {
      setError(error.message || "Failed to initiate subscription. Please try again.")
      setIsLoading(false)
      throw error
    }
  }

  const retryPayment = async () => {
    if (paymentRetryCount >= 3) {
      setError("Maximum retry attempts reached. Please contact support or try again later.")
      return
    }

    try {
      await handleEliteSubscription()
    } catch (error) {
      // Error handling is done in handleEliteSubscription
    }
  }

  async function handleSubmit() {
    if (!validateStep(5)) {
      setError("Please accept the terms and conditions")
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      // Handle Elite plan subscription first
      if (formData.plan === "elite" && !razorpaySubscriptionId) {
        await handleEliteSubscription()
      }

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          phone: phoneNumber,
          plan: formData.plan,
          razorpaySubscriptionId: formData.plan === "elite" ? razorpaySubscriptionId : "",
          razorpayPaymentId: formData.plan === "elite" ? razorpayPaymentId : "",
          razorpaySignature: formData.plan === "elite" ? razorpaySignature : "",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Signup failed")
      }

      const data = await response.json()
      toast.success("Account created successfully! Redirecting to your dashboard...")

      // Redirect to organization-specific dashboard
      setTimeout(() => {
        window.location.href = data.redirectUrl
      }, 1500)
    } catch (error: any) {
      setError(error.message || "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckLoginOrg = async () => {
    if (!loginOrgName.trim()) {
      setLoginOrgStatus({
        exists: false,
        message: "Please enter an organization name",
        isChecking: false,
      })
      return
    }

    const orgNameRegex = /^[a-zA-Z0-9-]+$/
    if (!orgNameRegex.test(loginOrgName)) {
      setLoginOrgStatus({
        exists: false,
        message: "Organization name can only contain letters, numbers, and hyphens",
        isChecking: false,
      })
      return
    }

    setLoginOrgStatus({ exists: null, message: "Checking organization...", isChecking: true })

    try {
      const response = await fetch(`${API_URL}/organizations/check/${loginOrgName.toLowerCase()}`)
      const data = await response.json()

      if (response.ok) {
        if (data.exists) {
          setLoginOrgStatus({
            exists: true,
            message: `Organization found! Redirecting to ${loginOrgName.toLowerCase()}.skillment.in`,
            isChecking: false,
          })

          setTimeout(() => {
            window.location.href = `https://${loginOrgName.toLowerCase()}.skillment.in`
          }, 1500)
        } else {
          setLoginOrgStatus({
            exists: false,
            message: "Organization not found. Please create an account instead.",
            isChecking: false,
          })
        }
      } else {
        setLoginOrgStatus({
          exists: false,
          message: data.error || "Failed to check organization",
          isChecking: false,
        })
      }
    } catch (error) {
      setLoginOrgStatus({
        exists: false,
        message: "Unable to connect. Please check your internet connection and try again.",
        isChecking: false,
      })
    }
  }

  const handleLoginKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCheckLoginOrg()
    }
  }

  const closeLoginPopup = () => {
    setShowLoginPopup(false)
    setLoginOrgName("")
    setLoginOrgStatus({ exists: null, message: "", isChecking: false })
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/10 mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Personal Information
              </h2>
              <p className="text-gray-400">Tell us about yourself to get started</p>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-300 font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    className="bg-black/30 backdrop-blur-xl border-white/10 text-white placeholder:text-gray-500 focus:border-purple-400/50 focus:ring-purple-400/20 hover:border-white/20 transition-all duration-300 h-12"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-300 font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-pink-400" />
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    className="bg-black/30 backdrop-blur-xl border-white/10 text-white placeholder:text-gray-500 focus:border-pink-400/50 focus:ring-pink-400/20 hover:border-white/20 transition-all duration-300 h-12"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300 font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-400" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="bg-black/30 backdrop-blur-xl border-white/10 text-white placeholder:text-gray-500 focus:border-orange-400/50 focus:ring-orange-400/20 hover:border-white/20 transition-all duration-300 h-12"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-300 font-medium flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  Phone Number
                </Label>
                <div className="flex">
                  <Select defaultValue="+91">
                    <SelectTrigger className="w-20 bg-black/30 backdrop-blur-xl border-white/10 text-white rounded-r-none focus:border-blue-400/50 h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 backdrop-blur-xl border-white/10">
                      <SelectItem value="+91" className="text-white hover:bg-white/10">
                        +91
                      </SelectItem>
                      <SelectItem value="+1" className="text-white hover:bg-white/10">
                        +1
                      </SelectItem>
                      <SelectItem value="+44" className="text-white hover:bg-white/10">
                        +44
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Phone Number"
                    className="flex-1 bg-black/30 backdrop-blur-xl border-white/10 text-white placeholder:text-gray-500 focus:border-blue-400/50 focus:ring-blue-400/20 rounded-l-none border-l-0 hover:border-white/20 transition-all duration-300 h-12"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-gray-300 font-medium">Gender</Label>
                <div className="flex space-x-4">
                  {["male", "female", "other"].map((gender) => (
                    <label
                      key={gender}
                      className="flex items-center space-x-2 cursor-pointer p-3 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 flex-1"
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={gender}
                        checked={formData.gender === gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="text-orange-500 focus:ring-orange-500/20 bg-black/40 border-white/20"
                      />
                      <span className="text-gray-300 capitalize text-sm">{gender === "other" ? "Other" : gender}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 mb-4">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                Organization Details
              </h2>
              <p className="text-gray-400">Information about your company</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="orgName" className="text-gray-300 font-medium flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  Organization Name
                </Label>
                <div className="flex items-center space-x-3">
                  <div className="relative flex-1">
                    <Input
                      id="orgName"
                      type="text"
                      placeholder="Your Company Name"
                      className={cn(
                        "bg-black/30 backdrop-blur-xl border-white/10 text-white placeholder:text-gray-500 focus:ring-purple-400/20 pr-12 hover:border-white/20 transition-all duration-300 h-12",
                        orgValidation.isChecking
                          ? "border-yellow-400/50 focus:border-yellow-400/50"
                          : orgValidation.isValid === true
                            ? "border-green-400/50 focus:border-green-400/50"
                            : orgValidation.isValid === false
                              ? "border-red-400/50 focus:border-red-400/50"
                              : "focus:border-purple-400/50",
                      )}
                      value={formData.orgName}
                      onChange={(e) => {
                        setFormData({ ...formData, orgName: e.target.value })
                        setOrgValidation({ isValid: null, message: "", isChecking: false })
                      }}
                      required
                      disabled={isLoading || orgValidation.isChecking}
                    />
                    {orgValidation.isChecking && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-400">
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </div>
                    )}
                    {orgValidation.isValid === true && !orgValidation.isChecking && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
                    )}
                    {orgValidation.isValid === false && !orgValidation.isChecking && (
                      <XCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <Button
                    type="button"
                    onClick={handleCheckOrgName}
                    disabled={isLoading || !formData.orgName || orgValidation.isChecking}
                    className="shrink-0 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 h-12 px-6 shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
                  >
                    <Search className="w-4 h-4 mr-2" /> Check
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Subdomain:{" "}
                    {formData.orgName ? `${formData.orgName.toLowerCase()}.skillment.in` : "your-org.skillment.in"}
                  </p>
                  {orgValidation.message && (
                    <p
                      className={cn(
                        "text-sm font-medium",
                        orgValidation.isValid === true ? "text-green-400" : "text-red-400",
                      )}
                    >
                      {orgValidation.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orgType" className="text-gray-300 font-medium">
                    Organization Type
                  </Label>
                  <Select
                    value={formData.orgType}
                    onValueChange={(value) => setFormData({ ...formData, orgType: value })}
                  >
                    <SelectTrigger className="bg-black/30 backdrop-blur-xl border-white/10 text-white focus:border-purple-400/50 hover:border-white/20 transition-all duration-300 h-12">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 backdrop-blur-xl border-white/10">
                      <SelectItem value="startup" className="text-white hover:bg-white/10">
                        Startup
                      </SelectItem>
                      <SelectItem value="company" className="text-white hover:bg-white/10">
                        Company
                      </SelectItem>
                      <SelectItem value="enterprise" className="text-white hover:bg-white/10">
                        Enterprise
                      </SelectItem>
                      <SelectItem value="educational" className="text-white hover:bg-white/10">
                        Educational
                      </SelectItem>
                      <SelectItem value="nonprofit" className="text-white hover:bg-white/10">
                        Non-Profit
                      </SelectItem>
                      <SelectItem value="government" className="text-white hover:bg-white/10">
                        Government
                      </SelectItem>
                      <SelectItem value="other" className="text-white hover:bg-white/10">
                        Other
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orgSize" className="text-gray-300 font-medium">
                    Organization Size
                  </Label>
                  <Select
                    value={formData.orgSize}
                    onValueChange={(value) => setFormData({ ...formData, orgSize: value })}
                  >
                    <SelectTrigger className="bg-black/30 backdrop-blur-xl border-white/10 text-white focus:border-purple-400/50 hover:border-white/20 transition-all duration-300 h-12">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 backdrop-blur-xl border-white/10">
                      <SelectItem value="1-10" className="text-white hover:bg-white/10">
                        1-10 employees
                      </SelectItem>
                      <SelectItem value="11-50" className="text-white hover:bg-white/10">
                        11-50 employees
                      </SelectItem>
                      <SelectItem value="51-200" className="text-white hover:bg-white/10">
                        51-200 employees
                      </SelectItem>
                      <SelectItem value="201-500" className="text-white hover:bg-white/10">
                        201-500 employees
                      </SelectItem>
                      <SelectItem value="501-1000" className="text-white hover:bg-white/10">
                        501-1000 employees
                      </SelectItem>
                      <SelectItem value="1000+" className="text-white hover:bg-white/10">
                        1000+ employees
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-sm border border-white/10 mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-green-200 to-blue-200 bg-clip-text text-transparent">
                Account Security
              </h2>
              <p className="text-gray-400">Create a secure password for your account</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300 font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-green-400" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    className="bg-black/30 backdrop-blur-xl border-white/10 text-white placeholder:text-gray-500 focus:border-green-400/50 focus:ring-green-400/20 pr-12 hover:border-white/20 transition-all duration-300 h-12"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300 font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="bg-black/30 backdrop-blur-xl border-white/10 text-white placeholder:text-gray-500 focus:border-blue-400/50 focus:ring-blue-400/20 pr-12 hover:border-white/20 transition-all duration-300 h-12"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <div className="p-3 bg-red-900/20 backdrop-blur-sm border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm font-medium">Passwords do not match</p>
                </div>
              )}

              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-5 space-y-3 border border-white/10">
                <p className="text-gray-300 text-sm font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  Password Requirements
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                    8+ characters
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
                    Uppercase letter
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                    Lowercase letter
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    Special character
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500/20 to-orange-500/20 backdrop-blur-sm border border-white/10 mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-orange-200 bg-clip-text text-transparent">
                Choose Your Plan
              </h2>
              <p className="text-gray-400">Select the perfect plan for your organization</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Free Plan */}
              <div
                className={`bg-black/20 backdrop-blur-sm rounded-xl p-6 space-y-6 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer relative ${formData.plan === "free" ? "border-green-500 shadow-lg shadow-green-500/20" : ""}`}
                onClick={() => setFormData({ ...formData, plan: "free" })}
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 mb-4">
                    <Sparkles className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                  <div className="text-3xl font-bold text-green-400 mb-1">₹0</div>
                  <p className="text-gray-400 text-sm">Forever free</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">Up to 50 students</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">Basic exam features</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">Email support</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">Basic analytics</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs text-gray-500 text-center">Perfect for small teams and getting started</p>
                </div>

                {formData.plan === "free" && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* Elite Plan */}
              <div
                className={`bg-black/20 backdrop-blur-sm rounded-xl p-6 space-y-6 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer relative ${formData.plan === "elite" ? "border-orange-500 shadow-lg shadow-orange-500/20" : ""}`}
                onClick={() => setFormData({ ...formData, plan: "elite" })}
              >
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 mb-4">
                    <Crown className="w-6 h-6 text-orange-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Elite</h3>
                  <div className="text-3xl font-bold text-orange-400 mb-1">₹999</div>
                  <p className="text-gray-400 text-sm">per month</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-orange-400 flex-shrink-0" />
                    <span className="text-gray-300">
                      <Infinity className="w-4 h-4 inline mr-1" />
                      Unlimited students
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-orange-400 flex-shrink-0" />
                    <span className="text-gray-300">Advanced proctoring</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-orange-400 flex-shrink-0" />
                    <span className="text-gray-300">Priority support</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-orange-400 flex-shrink-0" />
                    <span className="text-gray-300">Advanced analytics</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-orange-400 flex-shrink-0" />
                    <span className="text-gray-300">Custom branding</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-orange-400 flex-shrink-0" />
                    <span className="text-gray-300">API access</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs text-gray-500 text-center">For growing organizations with advanced needs</p>
                </div>

                {formData.plan === "elite" && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {formData.plan === "elite" && (
              <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 backdrop-blur-sm rounded-xl p-4 border border-orange-500/20">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="text-white font-medium">Elite Plan Selected</p>
                    <p className="text-gray-400 text-sm">You'll be charged ₹999/month. Cancel anytime.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange-500/20 to-pink-500/20 backdrop-blur-sm border border-white/10 mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-orange-200 to-pink-200 bg-clip-text text-transparent">
                Terms & Conditions
              </h2>
              <p className="text-gray-400">Review and accept our terms to complete signup</p>
            </div>

            <div className="space-y-6">
              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 space-y-4 border border-white/10">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-400" />
                  Account Summary
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                    <span className="text-gray-400">Full Name:</span>
                    <span className="text-white font-medium">
                      {formData.firstName} {formData.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white font-medium">{formData.email}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                    <span className="text-gray-400">Organization:</span>
                    <span className="text-white font-medium">{formData.orgName}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                    <span className="text-gray-400">Plan:</span>
                    <span className={`font-medium ${formData.plan === "elite" ? "text-orange-400" : "text-green-400"}`}>
                      {formData.plan === "elite" ? "Elite (₹999/month)" : "Free"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-black/10 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                  <Checkbox
                    id="terms"
                    checked={formData.termsAccepted}
                    onCheckedChange={(checked) => setFormData({ ...formData, termsAccepted: !!checked })}
                    className="mt-1 border-white/20 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-orange-500 data-[state=checked]:to-amber-500 data-[state=checked]:border-orange-500"
                  />
                  <Label htmlFor="terms" className="text-sm text-gray-300 leading-relaxed">
                    I agree to the{" "}
                    <a
                      href="#"
                      className="text-orange-400 hover:text-orange-300 underline font-medium transition-colors"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      className="text-orange-400 hover:text-orange-300 underline font-medium transition-colors"
                    >
                      Privacy Policy
                    </a>
                    . I understand that my information will be processed according to Skillment's data processing
                    guidelines.
                  </Label>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-black/10 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                  <Checkbox
                    id="newsletter"
                    checked={formData.newsletterOptIn}
                    onCheckedChange={(checked) => setFormData({ ...formData, newsletterOptIn: !!checked })}
                    className="mt-1 border-white/20 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500 data-[state=checked]:border-purple-500"
                  />
                  <Label htmlFor="newsletter" className="text-sm text-gray-300">
                    Send me updates about new features, platform improvements, and exclusive offers
                  </Label>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Advanced Background Effects */}
      <div className="absolute inset-0">
        {/* Animated gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/15 to-orange-900/20 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-blue-900/10 via-transparent to-purple-900/10"></div>

        {/* Multiple orbital rings with animations */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full border border-purple-500/20 animate-spin-slow"></div>
        <div className="absolute top-1/3 right-1/3 w-64 h-64 rounded-full border border-pink-500/30 animate-reverse-spin"></div>
        <div className="absolute top-1/2 right-1/2 w-32 h-32 rounded-full border border-orange-500/40 animate-pulse"></div>

        {/* Advanced glowing orbs */}
        <div className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-56 h-56 bg-gradient-to-r from-orange-500/15 to-amber-500/15 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-r from-pink-500/25 to-purple-500/25 rounded-full blur-xl animate-bounce-slow"></div>
        <div className="absolute bottom-1/4 right-1/3 w-24 h-24 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-lg animate-pulse"></div>

        {/* Floating particles */}
        <FloatingParticles />

        {/* Advanced grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:30px_30px] animate-pulse"></div>
        </div>
      </div>

      <div className="relative z-10 flex">
        {/* Left Side - Enhanced Branding */}
        <div className="hidden lg:flex lg:w-2/5 flex-col justify-between p-12 text-white">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Skillment
              </h1>
              <p className="text-gray-400 text-sm">Next-Gen Platform</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-10">
            <div>
              <h2 className="text-5xl font-bold leading-tight mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Grow Globally with
                <br />
                Our Platform
              </h2>
              <p className="text-xl text-gray-400 leading-relaxed">
                Easily conduct exams online, prevent cheating, and reach students all over the world with our
                cutting-edge technology.
              </p>
            </div>

            {/* Enhanced Orbital Element */}
            <div className="relative flex justify-center">
              <div className="w-80 h-80 relative">
                {/* Outer rotating ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 blur-sm animate-spin-slow"></div>

                {/* Main orbital ring */}
                <div className="absolute inset-4 rounded-full border-2 border-transparent bg-gradient-to-r from-purple-400/50 via-pink-400/50 to-orange-400/50 p-[2px] animate-reverse-spin">
                  <div className="w-full h-full rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
                    {/* Inner rotating element */}
                    <div className="absolute inset-8 rounded-full bg-gradient-to-r from-black/60 to-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center animate-pulse">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mb-3 mx-auto border border-white/10">
                          <Settings className="w-8 h-8 text-white animate-spin-slow" />
                        </div>
                        <div className="text-lg font-semibold text-white">Platform</div>
                        <div className="text-xs text-gray-400">AI-Powered</div>
                      </div>
                    </div>

                    {/* Floating elements inside ring */}
                    <div className="absolute top-6 right-12 w-20 h-20 opacity-40">
                      <div className="grid grid-cols-5 gap-1">
                        {Array.from({ length: 25 }).map((_, i) => (
                          <div
                            key={i}
                            className="w-1 h-1 bg-white/60 rounded-full animate-pulse"
                            style={{ animationDelay: `${i * 0.1}s` }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Orbiting satellites */}
                <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-purple-400 rounded-full animate-orbit"></div>
                <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-pink-400 rounded-full animate-orbit-reverse"></div>
                <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-orange-400 rounded-full animate-orbit-fast"></div>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="flex justify-between items-center">
            <p className="text-gray-500 text-sm">© 2024 Skillment. All rights reserved.</p>
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              </div>
              <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
              </div>
              <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Enhanced Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-lg">
            {/* Enhanced Progress Steps */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-6">
                {steps.map((step, index) => {
                  const StepIcon = step.icon
                  const isActive = currentStep === step.id
                  const isCompleted = currentStep > step.id
                  const isAccessible = currentStep >= step.id

                  return (
                    <div key={step.id} className="flex flex-col items-center space-y-3 relative">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 backdrop-blur-sm ${
                          isCompleted
                            ? "bg-gradient-to-r from-orange-500 to-amber-500 border-orange-500 text-white shadow-lg shadow-orange-500/25"
                            : isActive
                              ? "border-orange-500 text-orange-400 bg-black/20 shadow-lg shadow-orange-500/20"
                              : "border-white/20 text-gray-500 bg-black/10"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-6 h-6 animate-bounce" />
                        ) : (
                          <StepIcon className={`w-6 h-6 ${isActive ? "animate-pulse" : ""}`} />
                        )}
                      </div>
                      <div className="text-center">
                        <div className={`text-xs font-medium ${isAccessible ? "text-white" : "text-gray-500"}`}>
                          {step.title}
                        </div>
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`absolute top-6 left-12 w-16 h-0.5 transition-all duration-500 ${
                            isCompleted ? "bg-gradient-to-r from-orange-500 to-amber-500" : "bg-white/10"
                          }`}
                        ></div>
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 backdrop-blur-sm overflow-hidden">
                <div
                  className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 h-2 rounded-full transition-all duration-700 shadow-lg shadow-orange-500/30"
                  style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Enhanced Form Content */}
            <Card className="bg-black/10 backdrop-blur-2xl border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none"></div>
              <CardContent className="p-10 relative">
                {renderStepContent()}

                {error && (
                  <div className="mt-6 p-4 bg-red-900/20 backdrop-blur-sm border border-red-500/30 rounded-xl text-red-400 text-sm font-medium shadow-lg">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      {error}
                    </div>
                    {paymentRetryCount > 0 && paymentRetryCount < 3 && formData.plan === "elite" && (
                      <Button
                        onClick={retryPayment}
                        className="mt-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 px-4 py-2 text-sm"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry Payment ({3 - paymentRetryCount} attempts left)
                      </Button>
                    )}
                  </div>
                )}

                {/* Enhanced Navigation Buttons */}
                <div className="flex justify-between mt-10">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="border-white/20 text-gray-300 hover:bg-white/10 bg-black/20 backdrop-blur-sm h-12 px-8 transition-all duration-300 hover:border-white/30 disabled:opacity-50"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Previous
                  </Button>

                  {currentStep < 5 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 h-12 px-8 font-semibold shadow-lg hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105"
                    >
                      Next Step
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isLoading || !validateStep(5)}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 h-12 px-8 font-semibold shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          {formData.plan === "elite" ? "Processing Payment..." : "Creating Account..."}
                        </>
                      ) : (
                        <>
                          {formData.plan === "elite" ? "Subscribe & Create Account" : "Create Account"}
                          <Sparkles className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Login Link */}
            <div className="text-center mt-8">
              <span className="text-gray-400">Already have an account? </span>
              <button
                onClick={() => setShowLoginPopup(true)}
                className="text-orange-400 hover:text-orange-300 font-medium transition-colors hover:underline"
              >
                Sign in here
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Login Popup */}
      {showLoginPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black/20 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 w-full max-w-md overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none"></div>

            <div className="relative p-8">
              {/* Close button */}
              <button
                onClick={closeLoginPopup}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-400" />
              </button>

              {/* Header */}
              <div className="text-center space-y-4 mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                    Access Your Organization
                  </h3>
                  <p className="text-gray-400 mt-2">Enter your organization name to sign in</p>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="loginOrgName" className="text-gray-300 font-medium flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    Organization Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="loginOrgName"
                      type="text"
                      placeholder="your-organization"
                      className={cn(
                        "bg-black/30 backdrop-blur-xl border-white/10 text-white placeholder:text-gray-500 focus:ring-purple-400/20 pr-12 hover:border-white/20 transition-all duration-300 h-12",
                        loginOrgStatus.isChecking
                          ? "border-yellow-400/50 focus:border-yellow-400/50"
                          : loginOrgStatus.exists === true
                            ? "border-green-400/50 focus:border-green-400/50"
                            : loginOrgStatus.exists === false && loginOrgStatus.message
                              ? "border-red-400/50 focus:border-red-400/50"
                              : "focus:border-purple-400/50",
                      )}
                      value={loginOrgName}
                      onChange={(e) => {
                        setLoginOrgName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                        setLoginOrgStatus({ exists: null, message: "", isChecking: false })
                      }}
                      onKeyPress={handleLoginKeyPress}
                      disabled={loginOrgStatus.isChecking}
                      required
                    />
                    {loginOrgStatus.isChecking && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-400">
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </div>
                    )}
                    {loginOrgStatus.exists === true && !loginOrgStatus.isChecking && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
                    )}
                    {loginOrgStatus.exists === false && loginOrgStatus.message && !loginOrgStatus.isChecking && (
                      <XCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Your workspace: {loginOrgName ? `${loginOrgName}.skillment.in` : "your-org.skillment.in"}
                  </p>
                  {loginOrgStatus.message && (
                    <p
                      className={cn(
                        "text-sm font-medium",
                        loginOrgStatus.exists === true
                          ? "text-green-400"
                          : loginOrgStatus.exists === false
                            ? "text-red-400"
                            : "text-yellow-400",
                      )}
                    >
                      {loginOrgStatus.message}
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleCheckLoginOrg}
                    disabled={!loginOrgName.trim() || loginOrgStatus.isChecking}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 h-12 font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                  >
                    {loginOrgStatus.isChecking ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Checking...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-2" />
                        Access Organization
                      </>
                    )}
                  </Button>

                  {loginOrgStatus.exists === false && loginOrgStatus.message && !loginOrgStatus.isChecking && (
                    <div className="text-center pt-4 border-t border-white/10">
                      <p className="text-gray-400 text-sm mb-3">Organization not found? Create an account instead.</p>
                      <Button
                        onClick={closeLoginPopup}
                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 px-6 py-2 text-sm font-medium shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Create Account
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes reverse-spin {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-30px);
          }
        }
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes orbit {
          from {
            transform: translate(-50%, -50%) rotate(0deg) translateX(120px) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg) translateX(120px) rotate(-360deg);
          }
        }
        @keyframes orbit-reverse {
          from {
            transform: translate(-50%, -50%) rotate(0deg) translateX(100px) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(-360deg) translateX(100px) rotate(360deg);
          }
        }
        @keyframes orbit-fast {
          from {
            transform: translate(-50%, -50%) rotate(0deg) translateX(80px) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(720deg) translateX(80px) rotate(-720deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-reverse-spin {
          animation: reverse-spin 15s linear infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
        .animate-orbit {
          animation: orbit 20s linear infinite;
        }
        .animate-orbit-reverse {
          animation: orbit-reverse 15s linear infinite;
        }
        .animate-orbit-fast {
          animation: orbit-fast 10s linear infinite;
        }
      `}</style>
    </div>
  )
}
