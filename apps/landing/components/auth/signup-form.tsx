"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  ArrowRight,
  Lock,
  Mail,
  User,
  Building,
  School,
  Briefcase,
  Users,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react"
import { AnimatedButton } from "@/components/ui/aceternity/animated-button"
import { registerUser } from "@/app/actions/auth"
import { useRouter } from "next/navigation"
import { validateOrganization } from "@/lib/api"

const orgTypes = [
  { id: "university", label: "University/College", icon: School },
  { id: "company", label: "Company/Enterprise", icon: Building },
  { id: "bootcamp", label: "Bootcamp/Training", icon: Briefcase },
  { id: "recruitment", label: "Recruitment Agency", icon: Users },
]

const orgSizes = [
  { id: "small", label: "Small (1-50)" },
  { id: "medium", label: "Medium (51-500)" },
  { id: "large", label: "Large (501-5000)" },
  { id: "enterprise", label: "Enterprise (5000+)" },
]

const assessmentTypes = [
  { id: "technical", label: "Technical Interviews" },
  { id: "coding", label: "Coding Challenges" },
  { id: "algorithms", label: "Algorithms & Data Structures" },
  { id: "language", label: "Language Proficiency" },
  { id: "project", label: "Project-based Assessment" },
  { id: "certification", label: "Certification Exams" },
]

export const SignupForm = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    orgType: "",
    orgName: "",
    orgSize: "",
    assessmentTypes: [] as string[],
  })

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orgValidation, setOrgValidation] = useState<{
    isValid: boolean;
    message: string;
    isChecking: boolean;
  }>({
    isValid: true,
    message: "",
    isChecking: false
  })

  // Add debounced organization validation
  useEffect(() => {
    const validateOrgName = async () => {
      if (!formData.orgName) {
        setOrgValidation({ isValid: true, message: "", isChecking: false })
        return
      }

      setOrgValidation(prev => ({ ...prev, isChecking: true }))
      
      try {
        const result = await validateOrganization(formData.orgName)
        setOrgValidation({
          isValid: result.available,
          message: result.message,
          isChecking: false
        })
      } catch (error) {
        setOrgValidation({
          isValid: false,
          message: "Failed to validate organization name",
          isChecking: false
        })
      }
    }

    const timeoutId = setTimeout(validateOrgName, 500)
    return () => clearTimeout(timeoutId)
  }, [formData.orgName])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (id: string) => {
    setFormData((prev) => {
      const current = [...prev.assessmentTypes]
      if (current.includes(id)) {
        return { ...prev, assessmentTypes: current.filter((item) => item !== id) }
      } else {
        return { ...prev, assessmentTypes: [...current, id] }
      }
    })
  }

  const handleOrgTypeSelect = (id: string) => {
    setFormData((prev) => ({ ...prev, orgType: id }))
  }

  const handleOrgSizeSelect = (id: string) => {
    setFormData((prev) => ({ ...prev, orgSize: id }))
  }

  const validateCurrentStep = () => {
    setError(null)

    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        setError("All fields are required")
        return false
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match")
        return false
      }

      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters")
        return false
      }
    }

    if (currentStep === 2) {
      if (!formData.orgType || !formData.orgName || !formData.orgSize) {
        setError("All organization details are required")
        return false
      }

      // Validate organization name format
      const orgNameRegex = /^[a-zA-Z0-9-]+$/
      if (!orgNameRegex.test(formData.orgName)) {
        setError("Organization name can only contain letters, numbers, and hyphens")
        return false
      }
    }

    if (currentStep === 3) {
      if (formData.assessmentTypes.length === 0) {
        setError("Please select at least one assessment type")
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateCurrentStep()) {
      return
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsLoading(true)
      setError(null)

      try {
        const formDataToSubmit = new FormData()
        formDataToSubmit.append("firstName", formData.firstName)
        formDataToSubmit.append("lastName", formData.lastName)
        formDataToSubmit.append("email", formData.email)
        formDataToSubmit.append("password", formData.password)
        formDataToSubmit.append("orgName", formData.orgName)
        formDataToSubmit.append("orgType", formData.orgType)
        formDataToSubmit.append("orgSize", formData.orgSize)
        formDataToSubmit.append("assessmentTypes", JSON.stringify(formData.assessmentTypes))

        const result = await registerUser(formDataToSubmit)

        if (result.success) {
          // Redirect to the organization's subdomain
          window.location.href = result.redirectUrl
        } else {
          setError(result.error || "Registration failed")
        }
      } catch (err) {
        setError("An unexpected error occurred")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setError(null)
    }
  }

  return (
    <div className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-2xl p-8 w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Create Your Organization Account</h2>
        <p className="text-gray-400">Join Skillment to revolutionize your coding assessments</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[...Array(totalSteps)].map((_, index) => (
          <div key={index} className="flex items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                currentStep > index + 1
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                  : currentStep === index + 1
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                    : "bg-white/10 text-gray-400",
              )}
            >
              {currentStep > index + 1 ? <CheckCircle className="w-4 h-4" /> : index + 1}
            </div>
            {index < totalSteps - 1 && (
              <div
                className={cn(
                  "h-1 w-full mx-2",
                  currentStep > index + 1 ? "bg-gradient-to-r from-orange-500 to-red-500" : "bg-white/10",
                )}
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    placeholder="John"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    placeholder="Doe"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  placeholder="your@organization.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Organization Information */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">Organization Type</label>
              <div className="grid grid-cols-2 gap-4">
                {orgTypes.map((type) => (
                  <div
                    key={type.id}
                    className={cn(
                      "bg-black/50 border rounded-lg p-4 cursor-pointer transition-all duration-300",
                      formData.orgType === type.id
                        ? "border-orange-500 bg-orange-500/10"
                        : "border-white/10 hover:border-white/30",
                    )}
                    onClick={() => handleOrgTypeSelect(type.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          formData.orgType === type.id ? "bg-gradient-to-r from-orange-500 to-red-500" : "bg-white/10",
                        )}
                      >
                        <type.icon
                          className={cn("w-5 h-5", formData.orgType === type.id ? "text-white" : "text-gray-400")}
                        />
                      </div>
                      <span
                        className={cn("font-medium", formData.orgType === type.id ? "text-white" : "text-gray-300")}
                      >
                        {type.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="orgName" className="block text-sm font-medium text-gray-300 mb-2">
                Organization Name
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="orgName"
                  name="orgName"
                  value={formData.orgName}
                  onChange={handleChange}
                  className={cn(
                    "w-full bg-black/50 border rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2",
                    orgValidation.isChecking
                      ? "border-yellow-500/50 focus:ring-yellow-500/50"
                      : orgValidation.isValid
                        ? "border-green-500/50 focus:ring-green-500/50"
                        : "border-red-500/50 focus:ring-red-500/50"
                  )}
                  placeholder="Your Organization Name"
                  required
                  disabled={isLoading}
                />
                {formData.orgName && !orgValidation.isChecking && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {orgValidation.isValid ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  This will be your subdomain: {formData.orgName ? `${formData.orgName.toLowerCase()}.skillment.in` : ""}
                </p>
                {formData.orgName && !orgValidation.isChecking && (
                  <p className={cn(
                    "text-sm",
                    orgValidation.isValid ? "text-green-500" : "text-red-500"
                  )}>
                    {orgValidation.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">Organization Size</label>
              <div className="grid grid-cols-2 gap-4">
                {orgSizes.map((size) => (
                  <div
                    key={size.id}
                    className={cn(
                      "bg-black/50 border rounded-lg p-3 cursor-pointer transition-all duration-300 text-center",
                      formData.orgSize === size.id
                        ? "border-orange-500 bg-orange-500/10"
                        : "border-white/10 hover:border-white/30",
                    )}
                    onClick={() => handleOrgSizeSelect(size.id)}
                  >
                    <span className={cn("font-medium", formData.orgSize === size.id ? "text-white" : "text-gray-300")}>
                      {size.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Assessment Types */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">Select Assessment Types</label>
              <div className="grid grid-cols-2 gap-4">
                {assessmentTypes.map((type) => (
                  <div
                    key={type.id}
                    className={cn(
                      "bg-black/50 border rounded-lg p-4 cursor-pointer transition-all duration-300",
                      formData.assessmentTypes.includes(type.id)
                        ? "border-orange-500 bg-orange-500/10"
                        : "border-white/10 hover:border-white/30",
                    )}
                    onClick={() => handleCheckboxChange(type.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "font-medium",
                          formData.assessmentTypes.includes(type.id) ? "text-white" : "text-gray-300",
                        )}
                      >
                        {type.label}
                      </span>
                      {formData.assessmentTypes.includes(type.id) && (
                        <CheckCircle className="w-5 h-5 text-orange-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={goBack}
              className="px-6 py-3 text-gray-300 hover:text-white transition-colors"
              disabled={isLoading}
            >
              Back
            </button>
          )}
          <AnimatedButton
            type="submit"
            colors={["#ea580c", "#dc2626", "#be185d"]}
            className="ml-auto px-6 py-3 text-lg group"
            disabled={isLoading}
          >
            {isLoading ? (
              "Processing..."
            ) : currentStep < totalSteps ? (
              <>
                Next Step
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            ) : (
              "Create Account"
            )}
          </AnimatedButton>
        </div>
      </form>
    </div>
  )
}
