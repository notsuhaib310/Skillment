"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ArrowRight, Eye, EyeOff, Shield, Check, User, Building2, Lock, FileText, CheckCircle, XCircle, Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3001"

const steps = [
  { id: 1, title: "Personal Info", icon: User, description: "Basic information about you" },
  { id: 2, title: "Organization", icon: Building2, description: "Your company details" },
  { id: 3, title: "Security", icon: Lock, description: "Create your account password" },
  { id: 4, title: "Terms", icon: FileText, description: "Review and accept terms" },
]

export default function SignUpPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
  })
  const [orgValidation, setOrgValidation] = useState<{
    isValid: boolean | null;
    message: string;
    isChecking: boolean;
  }>({
    isValid: null,
    message: "",
    isChecking: false
  })

  const handleCheckOrgName = async () => {
    if (!formData.orgName) {
      setOrgValidation({ isValid: null, message: "Please enter an organization name", isChecking: false })
      return
    }

    setOrgValidation(prev => ({ ...prev, isChecking: true, isValid: null, message: "Checking availability..." }))
    
    try {
      const response = await fetch(`${API_URL}/organizations/validate/${formData.orgName}`)
      const data = await response.json()

      console.log("Org Validation Response Status:", response.status)
      console.log("Org Validation Response Data:", data)
      
      if (response.ok) {
        setOrgValidation({
          isValid: data.available,
          message: data.message,
          isChecking: false
        })
      } else {
        setOrgValidation({
          isValid: false,
          message: data.error || "Failed to validate organization name",
          isChecking: false
        })
      }
    } catch (error) {
      console.error("Error during organization validation fetch:", error)
      setOrgValidation({
        isValid: false,
        message: "An error occurred while checking. Please try again.",
        isChecking: false
      })
    }
  }

  const validateStep = (step: number): boolean => {
    console.log(`Frontend Validate Step: Checking step ${step}`)
    console.log(`Frontend Validate Step: current orgValidation state:`, orgValidation)

    switch (step) {
      case 1:
        const step1Valid = !!(formData.firstName && formData.lastName && formData.email && formData.phone && formData.gender)
        console.log(`Frontend Validate Step 1: ${step1Valid ? 'Valid' : 'Invalid'}`)
        return step1Valid
      case 2:
        const step2Valid = !!(formData.orgName && formData.orgType && formData.orgSize && orgValidation.isValid === true)
        console.log(`Frontend Validate Step 2: formData.orgName=${formData.orgName}, formData.orgType=${formData.orgType}, formData.orgSize=${formData.orgSize}, orgValidation.isValid=${orgValidation.isValid}`)
        console.log(`Frontend Validate Step 2: Final result = ${step2Valid ? 'Valid' : 'Invalid'}`)
        return step2Valid
      case 3:
        const step3Valid = !!(formData.password && formData.confirmPassword && formData.password === formData.confirmPassword)
        console.log(`Frontend Validate Step 3: ${step3Valid ? 'Valid' : 'Invalid'}`)
        return step3Valid
      case 4:
        const step4Valid = formData.termsAccepted
        console.log(`Frontend Validate Step 4: ${step4Valid ? 'Valid' : 'Invalid'}`)
        return step4Valid
      default:
        console.log(`Frontend Validate Step: Unknown step ${step}`)
        return false
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(Math.min(currentStep + 1, steps.length))
      setError(null)
    } else {
      if (currentStep === 2 && orgValidation.isValid === false) {
        setError(orgValidation.message || "Please enter a valid and available organization name.")
      } else {
        setError("Please fill in all required fields")
      }
    }
  }

  const prevStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 1))
    setError(null)
  }

  async function handleSubmit() {
    if (!validateStep(4)) {
      setError("Please accept the terms and conditions")
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        // Attempt to parse error message from backend
        const errorData = await response.json()
        throw new Error(errorData.message || "Signup failed")
      }

      toast.success("Account created successfully! Redirecting to your organization's dashboard.")
      
      // Construct the organization-specific dashboard URL
      const orgSpecificDashboardUrl = `https://${formData.orgName.toLowerCase()}.skillment.in/dashboard`
      router.push(orgSpecificDashboardUrl)

    } catch (error: any) {
      setError(error.message || "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-gray-900">Personal Information</h2>
              <p className="text-gray-600">Tell us about yourself</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-700 font-medium">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    className="border-gray-300 focus:border-slate-500 focus:ring-slate-500"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-700 font-medium">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    className="border-gray-300 focus:border-slate-500 focus:ring-slate-500"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="border-gray-300 focus:border-slate-500 focus:ring-slate-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700 font-medium">
                  Phone Number
                </Label>
                <div className="flex">
                  <Select defaultValue="+91">
                    <SelectTrigger className="w-20 border-gray-300 rounded-r-none focus:border-slate-500">
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
                    type="tel"
                    placeholder="Phone Number"
                    className="flex-1 border-gray-300 focus:border-slate-500 focus:ring-slate-500 rounded-l-none border-l-0"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Gender</Label>
                <div className="flex space-x-6">
                  {["male", "female", "other"].map((gender) => (
                    <label key={gender} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value={gender}
                        checked={formData.gender === gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-gray-700 capitalize">
                        {gender === "other" ? "Prefer not to say" : gender}
                      </span>
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
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-gray-900">Organization Details</h2>
              <p className="text-gray-600">Information about your company</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName" className="text-gray-700 font-medium">
                  Organization Name
                </Label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Input
                      id="orgName"
                      type="text"
                      placeholder="Your Company Name"
                      className={cn(
                        "border-gray-300 focus:ring-slate-500 pr-10",
                        orgValidation.isChecking
                          ? "border-yellow-500 focus:border-yellow-500"
                          : orgValidation.isValid === true
                            ? "border-green-500 focus:border-green-500"
                            : orgValidation.isValid === false
                              ? "border-red-500 focus:border-red-500"
                              : ""
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
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-500">
                        <svg className="animate-spin h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    )}
                    {orgValidation.isValid === true && !orgValidation.isChecking && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                    {orgValidation.isValid === false && !orgValidation.isChecking && (
                      <XCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <Button
                    type="button"
                    onClick={handleCheckOrgName}
                    disabled={isLoading || !formData.orgName || orgValidation.isChecking}
                    className="shrink-0"
                  >
                    <Search className="w-4 h-4 mr-2" /> Check
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    This will be your subdomain: {formData.orgName ? `${formData.orgName.toLowerCase()}.skillment.in` : ""}
                  </p>
                  {orgValidation.message && (
                    <p className={cn(
                      "text-sm",
                      orgValidation.isValid === true ? "text-green-500" : "text-red-500"
                    )}>
                      {orgValidation.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgType" className="text-gray-700 font-medium">
                  Organization Type
                </Label>
                <Select
                  value={formData.orgType}
                  onValueChange={(value) => setFormData({ ...formData, orgType: value })}
                >
                  <SelectTrigger className="border-gray-300 focus:border-slate-500">
                    <SelectValue placeholder="Select organization type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">Startup</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                    <SelectItem value="educational">Educational Institution</SelectItem>
                    <SelectItem value="nonprofit">Non-Profit</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgSize" className="text-gray-700 font-medium">
                  Organization Size
                </Label>
                <Select
                  value={formData.orgSize}
                  onValueChange={(value) => setFormData({ ...formData, orgSize: value })}
                >
                  <SelectTrigger className="border-gray-300 focus:border-slate-500">
                    <SelectValue placeholder="Select organization size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="501-1000">501-1000 employees</SelectItem>
                    <SelectItem value="1000+">1000+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-gray-900">Account Security</h2>
              <p className="text-gray-600">Create a secure password</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    className="border-gray-300 focus:border-slate-500 focus:ring-slate-500 pr-10"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="border-gray-300 focus:border-slate-500 focus:ring-slate-500 pr-10"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-red-500 text-sm">Passwords do not match</p>
              )}

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-gray-700 text-sm font-medium">Password requirements:</p>
                <ul className="text-gray-600 text-xs space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• Contains uppercase and lowercase letters</li>
                  <li>• Contains at least one number</li>
                  <li>• Contains at least one special character</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-gray-900">Terms & Conditions</h2>
              <p className="text-gray-600">Review and accept our terms</p>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <h3 className="text-gray-900 font-medium">Account Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="text-gray-900 font-medium">
                      {formData.firstName} {formData.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="text-gray-900 font-medium">{formData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Organization:</span>
                    <span className="text-gray-900 font-medium">{formData.orgName}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={formData.termsAccepted}
                    onCheckedChange={(checked) => setFormData({ ...formData, termsAccepted: !!checked })}
                    className="mt-1"
                  />
                  <Label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                    I agree to the{" "}
                    <a href="#" className="text-slate-600 hover:underline font-medium">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-slate-600 hover:underline font-medium">
                      Privacy Policy
                    </a>
                    . I understand that my information will be processed according to Skillment's data processing
                    guidelines.
                  </Label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="newsletter"
                    checked={formData.newsletterOptIn}
                    onCheckedChange={(checked) => setFormData({ ...formData, newsletterOptIn: !!checked })}
                    className="mt-1"
                  />
                  <Label htmlFor="newsletter" className="text-sm text-gray-700">
                    Send me updates about new features and platform improvements
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Professional Branding */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fillRule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fillOpacity=&quot;0.1&quot;%3E%3Ccircle cx=&quot;7&quot; cy=&quot;7&quot; r=&quot;7&quot;/%3E%3Ccircle cx=&quot;53&quot; cy=&quot;7&quot; r=&quot;7&quot;/%3E%3Ccircle cx=&quot;7&quot; cy=&quot;53&quot; r=&quot;7&quot;/%3E%3Ccircle cx=&quot;53&quot; cy=&quot;53&quot; r=&quot;7&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Skillment</h1>
              <p className="text-gray-300 text-sm">Event Management Platform</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold leading-tight mb-4">
                Professional Event
                <br />
                Management Platform
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                Join thousands of organizations using Skillment to create, manage, and analyze their events with
                enterprise-grade tools.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Advanced Analytics</h3>
                  <p className="text-gray-400 text-sm">Comprehensive insights and performance tracking</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Participant Management</h3>
                  <p className="text-gray-400 text-sm">Complete tools for event organization</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Enterprise Security</h3>
                  <p className="text-gray-400 text-sm">Bank-grade security and compliance</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">5,000+</div>
              <div className="text-gray-400 text-sm">Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">100K+</div>
              <div className="text-gray-400 text-sm">Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">99.9%</div>
              <div className="text-gray-400 text-sm">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Multi-Step Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => {
                const StepIcon = step.icon
                const isActive = currentStep === step.id
                const isCompleted = currentStep > step.id
                const isAccessible = currentStep >= step.id

                return (
                  <div key={step.id} className="flex flex-col items-center space-y-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                        isCompleted
                          ? "bg-slate-600 border-slate-600 text-white"
                          : isActive
                            ? "border-slate-600 text-slate-600 bg-white"
                            : "border-gray-300 text-gray-400 bg-white"
                      }`}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                    </div>
                    <div className="text-center">
                      <div className={`text-xs font-medium ${isAccessible ? "text-gray-900" : "text-gray-400"}`}>
                        {step.title}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className="bg-slate-600 h-1 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Form Content */}
          <Card className="bg-white border-gray-200 shadow-lg">
            <CardContent className="p-8">
              {renderStepContent()}

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentStep < steps.length ? (
                  <Button type="button" onClick={nextStep} className="bg-slate-600 hover:bg-slate-700 text-white">
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading || !validateStep(4)}
                    className="bg-slate-600 hover:bg-slate-700 text-white"
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Login Link */}
          <div className="text-center mt-6">
            <span className="text-gray-600">Already have an account? </span>
            <button onClick={() => router.push("/login")} className="text-slate-600 hover:underline font-medium">
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
