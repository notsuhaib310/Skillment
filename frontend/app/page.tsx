"use client"
import { ArrowRight, Star } from "lucide-react"
import { AnimatedGradient } from "@/components/ui/aceternity/animated-gradient"
import { TextReveal } from "@/components/ui/aceternity/text-reveal"
import { Spotlight } from "@/components/ui/aceternity/spotlight"
import { CardHover } from "@/components/ui/aceternity/card-hover"
import { AnimatedTooltip } from "@/components/ui/aceternity/animated-tooltip"
import { AnimatedButton } from "@/components/ui/aceternity/animated-button"
import PlatformShowcase from "@/components/ui/aceternity/platform-showcase"
import { ModernNavbar } from "@/components/ui/aceternity/modern-navbar"
import { EnhancedPricing } from "@/components/ui/aceternity/enhanced-pricing"
import { MinimalistFooter } from "@/components/ui/aceternity/minimalist-footer"
import { ScrollStack } from "@/components/ui/aceternity/scroll-stack"
import { EnhancedHero } from "@/components/ui/aceternity/enhanced-hero"
import { EnhancedSecurity } from "@/components/ui/aceternity/enhanced-security"
import { PartnersSection } from "@/components/ui/aceternity/partners-section"

export default function LandingPage() {
  const testimonials = [
    {
      id: 1,
      name: "Dr. Sarah Chen",
      designation: "Stanford University",
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "Mike Rodriguez",
      designation: "Lambda School",
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "Emily Johnson",
      designation: "TechCorp Recruiting",
      image: "/placeholder.svg?height=40&width=40",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Modern Navigation */}
      <ModernNavbar />

      {/* Enhanced Hero Section */}
      <EnhancedHero />

      {/* Platform Showcase Section */}
      <section id="platform" className="max-w-8xl mx-auto px-6 lg:px-12 xl:px-16 py-20 relative z-10">
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <TextReveal className="text-4xl md:text-5xl font-bold mb-4">
            <h2>Experience the Future of Coding Assessments</h2>
          </TextReveal>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover how our AI-powered platform transforms the way you conduct and manage coding examinations
          </p>
        </div>

        <PlatformShowcase />
      </section>

      {/* Partners & Integrations Section */}
      <PartnersSection />

      {/* How it Works - Scroll Stack */}
      <section id="how-it-works" className="relative z-10">
        <ScrollStack />
      </section>

      {/* Enhanced Security Section */}
      <section id="security" className="relative z-10">
        <EnhancedSecurity />
      </section>

      {/* Testimonials */}
      <section className="max-w-8xl mx-auto px-6 lg:px-12 xl:px-16 py-20 relative z-10">
        <div className="text-center mb-16">
          <TextReveal className="text-4xl md:text-5xl font-bold mb-4">
            <h2>Trusted by Leading Institutions</h2>
          </TextReveal>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            See what educators and recruiters say about CodeProctor
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <AnimatedTooltip items={testimonials} />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <CardHover>
            <div className="bg-white/10 backdrop-blur-sm border-white/20 p-6 rounded-lg h-full">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "CodeProctor has revolutionized how we conduct coding assessments. The AI proctoring gives us confidence
                in exam integrity while the instant feedback helps our students learn faster."
              </p>
              <div className="flex items-center">
                <img
                  src="/placeholder.svg?height=40&width=40"
                  alt="Dr. Sarah Chen"
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="font-semibold">Dr. Sarah Chen</p>
                  <p className="text-sm text-gray-400">Stanford University</p>
                </div>
              </div>
            </div>
          </CardHover>

          <CardHover>
            <div className="bg-white/10 backdrop-blur-sm border-white/20 p-6 rounded-lg h-full">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "The multi-language support and AI-generated test cases have saved us countless hours. Our bootcamp
                students love the immediate feedback and detailed analytics."
              </p>
              <div className="flex items-center">
                <img
                  src="/placeholder.svg?height=40&width=40"
                  alt="Mike Rodriguez"
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="font-semibold">Mike Rodriguez</p>
                  <p className="text-sm text-gray-400">Lambda School</p>
                </div>
              </div>
            </div>
          </CardHover>

          <CardHover>
            <div className="bg-white/10 backdrop-blur-sm border-white/20 p-6 rounded-lg h-full">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "As a tech recruiter, CodeProctor has streamlined our technical screening process. The proctoring
                ensures candidate authenticity while the detailed reports help us make better hiring decisions."
              </p>
              <div className="flex items-center">
                <img
                  src="/placeholder.svg?height=40&width=40"
                  alt="Emily Johnson"
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="font-semibold">Emily Johnson</p>
                  <p className="text-sm text-gray-400">TechCorp Recruiting</p>
                </div>
              </div>
            </div>
          </CardHover>
        </div>
      </section>

      {/* Enhanced Pricing */}
      <AnimatedGradient
        containerClassName="py-20"
        colors={["rgba(15, 32, 39, 0.8)", "rgba(32, 58, 67, 0.8)", "rgba(44, 83, 100, 0.8)"]}
        className="w-full h-full"
      >
        <section id="pricing" className="max-w-8xl mx-auto px-6 lg:px-12 xl:px-16 relative z-10">
          <div className="text-center mb-16">
            <TextReveal className="text-4xl md:text-5xl font-bold mb-4">
              <h2>Simple, Transparent Pricing</h2>
            </TextReveal>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Choose the plan that fits your institution's needs
            </p>
          </div>

          <EnhancedPricing />
        </section>
      </AnimatedGradient>

      {/* Final CTA */}
      <Spotlight className="max-w-8xl mx-auto px-6 lg:px-12 xl:px-16 py-20 text-center">
        <div className="max-w-5xl mx-auto">
          <TextReveal className="text-4xl md:text-5xl font-bold mb-6">
            <h2>Ready to Launch Your Coding Exams with AI?</h2>
          </TextReveal>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of educators and recruiters who trust Skillment for secure, efficient coding assessments.
          </p>
          <AnimatedButton colors={["#ea580c", "#dc2626", "#be185d"]} className="px-12 py-4 text-xl group">
            Start Your Free Trial
            <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </AnimatedButton>
        </div>
      </Spotlight>

      {/* Minimalist Footer */}
      <MinimalistFooter />
    </div>
  )
}
