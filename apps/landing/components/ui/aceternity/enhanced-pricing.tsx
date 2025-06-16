"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Check, Star, Zap, Crown, Building2, ArrowRight } from "lucide-react"

const pricingPlans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "Perfect for trying out CodeProctor",
    icon: Zap,
    color: "from-blue-500 to-cyan-500",
    popular: false,
    features: [
      "Up to 10 exams per month",
      "Basic AI proctoring",
      "5 programming languages",
      "Email support",
      "Standard templates",
      "Basic analytics",
    ],
    limitations: ["Limited customization", "No API access"],
  },
  {
    name: "Professional",
    price: "$99",
    period: "/month",
    description: "Ideal for universities and bootcamps",
    icon: Star,
    color: "from-orange-500 to-red-500",
    popular: true,
    features: [
      "Unlimited exams",
      "Advanced AI proctoring",
      "20+ programming languages",
      "Priority support",
      "Custom branding",
      "Advanced analytics",
      "Plagiarism detection",
      "Live monitoring dashboard",
      "Custom test templates",
      "Bulk user management",
    ],
    limitations: [],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations with specific needs",
    icon: Building2,
    color: "from-purple-500 to-pink-500",
    popular: false,
    features: [
      "Everything in Professional",
      "SSO integration",
      "API access",
      "Dedicated support manager",
      "Custom integrations",
      "White-label solution",
      "Advanced security features",
      "Custom deployment",
      "Training & onboarding",
      "SLA guarantee",
    ],
    limitations: [],
  },
]

export const EnhancedPricing = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

  return (
    <div className="relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-purple-500/10 blur-3xl" />

      <div className="relative max-w-8xl mx-auto px-6 lg:px-12">
        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-full p-1 flex">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                billingCycle === "monthly"
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                  : "text-gray-400 hover:text-white",
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 relative",
                billingCycle === "yearly"
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                  : "text-gray-400 hover:text-white",
              )}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                "relative bg-white/5 backdrop-blur-sm border rounded-2xl p-8 hover:bg-white/10 transition-all duration-300",
                plan.popular
                  ? "border-orange-500/50 scale-105 shadow-2xl shadow-orange-500/20"
                  : "border-white/10 hover:border-white/20",
              )}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
                    <Crown className="w-4 h-4" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                >
                  <plan.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400">{plan.description}</p>
              </div>

              {/* Pricing */}
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-white">{plan.price}</span>
                  {plan.period && <span className="text-gray-400 ml-2">{plan.period}</span>}
                </div>
                {billingCycle === "yearly" && plan.price !== "Free" && plan.price !== "Custom" && (
                  <div className="text-green-400 text-sm mt-2">
                    Save ${Math.round(Number.parseInt(plan.price.replace("$", "")) * 12 * 0.2)} per year
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-green-400" />
                    </div>
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
                {plan.limitations.map((limitation, limitIndex) => (
                  <div key={limitIndex} className="flex items-start space-x-3 opacity-60">
                    <div className="w-5 h-5 bg-red-500/20 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-red-400 text-xs">×</span>
                    </div>
                    <span className="text-gray-400 text-sm line-through">{limitation}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "w-full py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 group",
                  plan.popular
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg hover:shadow-orange-500/25"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/20",
                )}
              >
                <span>{plan.price === "Custom" ? "Contact Sales" : "Get Started"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              {/* Additional Info */}
              {plan.name === "Professional" && (
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-400">14-day free trial • No credit card required</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-20 max-w-4xl mx-auto"
        >
          <p className="text-gray-400 mb-4">Need a custom solution? We're here to help.</p>
          <button className="text-orange-400 hover:text-orange-300 font-medium flex items-center space-x-2 mx-auto transition-colors">
            <span>Schedule a demo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </div>
  )
}
