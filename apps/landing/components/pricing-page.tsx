"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Check, Star, Zap, Crown, Building2, ArrowRight, Calculator, HelpCircle, Shield } from "lucide-react"
import { ModernNavbar } from "@/components/ui/aceternity/modern-navbar"
import { MinimalistFooter } from "@/components/ui/aceternity/minimalist-footer"
import { AnimatedButton } from "@/components/ui/aceternity/animated-button"
import { CardHover } from "@/components/ui/aceternity/card-hover"

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

  const pricingPlans = [
    {
      name: "Starter",
      price: "Free",
      period: "",
      description: "Perfect for trying out Skillment",
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
        "Community forum access",
        "Mobile app access",
      ],
      limitations: ["Limited customization", "No API access", "Basic reporting only"],
      cta: "Get Started Free",
    },
    {
      name: "Professional",
      price: billingCycle === "monthly" ? "$99" : "$79",
      period: billingCycle === "monthly" ? "/month" : "/month",
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
        "LMS integration",
        "White-label options",
      ],
      limitations: [],
      cta: "Start Free Trial",
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
        "Custom contracts",
        "Multi-region deployment",
      ],
      limitations: [],
      cta: "Contact Sales",
    },
  ]

  const addOns = [
    {
      name: "Advanced Analytics",
      price: "$29",
      period: "/month",
      description: "Deep insights and custom reporting",
      features: ["Custom dashboards", "Data export", "Advanced metrics", "Trend analysis"],
    },
    {
      name: "Premium Support",
      price: "$49",
      period: "/month",
      description: "24/7 priority support with dedicated manager",
      features: ["24/7 phone support", "Dedicated manager", "Priority tickets", "Training sessions"],
    },
    {
      name: "Custom Integrations",
      price: "$199",
      period: "/month",
      description: "Connect with your existing tools and systems",
      features: ["API development", "Custom connectors", "Data sync", "Technical support"],
    },
  ]

  const faqs = [
    {
      question: "Can I change my plan at any time?",
      answer:
        "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences.",
    },
    {
      question: "Is there a free trial available?",
      answer:
        "Yes, we offer a 14-day free trial for our Professional plan. No credit card required to start your trial.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards, PayPal, and bank transfers for annual plans. Enterprise customers can also pay by invoice.",
    },
    {
      question: "Do you offer discounts for educational institutions?",
      answer:
        "Yes, we offer special pricing for educational institutions, non-profits, and startups. Contact our sales team for details.",
    },
    {
      question: "What happens if I exceed my plan limits?",
      answer:
        "We'll notify you when you're approaching your limits. You can upgrade your plan or purchase additional capacity as needed.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Absolutely. We use enterprise-grade security with SOC 2 compliance, end-to-end encryption, and regular security audits.",
    },
  ]

  const calculateYearlySavings = (monthlyPrice: string) => {
    if (monthlyPrice === "Free" || monthlyPrice === "Custom") return 0
    const monthly = Number.parseInt(monthlyPrice.replace("$", ""))
    return Math.round(monthly * 12 * 0.2)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <ModernNavbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full text-orange-400 text-sm font-medium border border-orange-500/30 mb-6"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Simple, Transparent Pricing
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-white via-orange-200 to-red-200 bg-clip-text text-transparent">
              Choose Your Plan
            </span>
            <br />
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Scale with Confidence
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            From startups to enterprises, we have the perfect plan for your coding assessment needs. Start free and
            scale as you grow.
          </motion.p>
        </div>
      </section>

      {/* Billing Toggle */}
      <section className="pb-12">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <div className="flex justify-center mb-8">
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
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <CardHover>
                  <div
                    className={cn(
                      "relative bg-white/5 backdrop-blur-sm border rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 h-full",
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
                          Save ${calculateYearlySavings(plan.price)} per year
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
                      <span>{plan.cta}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.button>

                    {/* Additional Info */}
                    {plan.name === "Professional" && (
                      <div className="mt-4 text-center">
                        <p className="text-xs text-gray-400">14-day free trial • No credit card required</p>
                      </div>
                    )}
                  </div>
                </CardHover>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Enhance Your Plan</h2>
            <p className="text-xl text-gray-300">Optional add-ons to supercharge your assessment platform</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {addOns.map((addon, index) => (
              <motion.div
                key={addon.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/5 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">{addon.name}</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-400">{addon.price}</div>
                    <div className="text-gray-400 text-sm">{addon.period}</div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-4">{addon.description}</p>
                <div className="space-y-2">
                  {addon.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500/20 rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-green-400" />
                      </div>
                      <span className="text-gray-400 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-300">Everything you need to know about our pricing</p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-xl p-6"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                    <p className="text-gray-300">{faq.answer}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Trust */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-8 text-center">
            <Shield className="w-16 h-16 text-orange-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Enterprise-Grade Security</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Your data is protected with SOC 2 compliance, end-to-end encryption, and regular security audits. We take
              security seriously so you can focus on what matters most.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              {["SOC 2 Type II", "ISO 27001", "GDPR Compliant", "99.9% Uptime SLA"].map((cert, index) => (
                <div
                  key={cert}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 text-sm text-white"
                >
                  {cert}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-gray-300 mb-8">
              Join thousands of educators and recruiters who trust Skillment for secure coding assessments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <AnimatedButton colors={["#ea580c", "#dc2626", "#be185d"]} className="px-8 py-3 group">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </AnimatedButton>
              <button className="px-8 py-3 border border-white/20 rounded-lg text-white hover:bg-white/5 transition-colors">
                Schedule Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <MinimalistFooter />
    </div>
  )
}
