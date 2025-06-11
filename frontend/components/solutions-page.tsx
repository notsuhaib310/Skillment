"use client"
import { motion } from "framer-motion"
import {
  GraduationCap,
  Building2,
  Users,
  Code,
  Shield,
  BarChart3,
  Zap,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Briefcase,
  School,
} from "lucide-react"
import { ModernNavbar } from "@/components/ui/aceternity/modern-navbar"
import { MinimalistFooter } from "@/components/ui/aceternity/minimalist-footer"
import { AnimatedButton } from "@/components/ui/aceternity/animated-button"
import { CardHover } from "@/components/ui/aceternity/card-hover"

export default function SolutionsPage() {
  const solutions = [
    {
      icon: GraduationCap,
      title: "Universities & Colleges",
      description: "Comprehensive coding assessment platform for academic institutions",
      features: [
        "Academic integrity monitoring",
        "Grade book integration",
        "Student progress tracking",
        "Bulk exam management",
        "Custom curriculum support",
        "Plagiarism detection",
      ],
      gradient: "from-blue-500 to-cyan-500",
      stats: { users: "50K+", institutions: "200+", satisfaction: "98%" },
    },
    {
      icon: Building2,
      title: "Enterprise & Corporations",
      description: "Scalable solutions for large organizations and tech companies",
      features: [
        "White-label platform",
        "SSO integration",
        "Advanced analytics",
        "Custom branding",
        "API access",
        "Dedicated support",
      ],
      gradient: "from-orange-500 to-red-500",
      stats: { users: "100K+", companies: "500+", satisfaction: "99%" },
    },
    {
      icon: Briefcase,
      title: "Recruitment & HR",
      description: "Streamline technical hiring with secure coding assessments",
      features: [
        "Candidate screening",
        "Interview scheduling",
        "Skills assessment",
        "Automated scoring",
        "Candidate reports",
        "ATS integration",
      ],
      gradient: "from-purple-500 to-pink-500",
      stats: { hires: "25K+", companies: "300+", time_saved: "70%" },
    },
    {
      icon: BookOpen,
      title: "Bootcamps & Training",
      description: "Perfect for coding bootcamps and professional training programs",
      features: [
        "Progress tracking",
        "Skill assessments",
        "Certification exams",
        "Student analytics",
        "Instructor dashboard",
        "Course integration",
      ],
      gradient: "from-green-500 to-teal-500",
      stats: { students: "30K+", bootcamps: "150+", completion: "85%" },
    },
  ]

  const features = [
    {
      icon: Code,
      title: "Multi-Language Support",
      description: "Support for 20+ programming languages including Python, Java, JavaScript, C++, and more.",
    },
    {
      icon: Shield,
      title: "Advanced Security",
      description: "AI-powered proctoring, secure browser lockdown, and comprehensive monitoring.",
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Detailed insights and performance metrics with customizable reporting.",
    },
    {
      icon: Zap,
      title: "Instant Feedback",
      description: "Automated scoring and immediate feedback to enhance learning outcomes.",
    },
  ]

  const useCases = [
    {
      title: "Computer Science Courses",
      description: "Assess students in algorithms, data structures, and programming fundamentals",
      icon: School,
      benefits: ["Automated grading", "Plagiarism detection", "Progress tracking"],
    },
    {
      title: "Technical Interviews",
      description: "Conduct fair and consistent technical interviews for software engineering roles",
      icon: Users,
      benefits: ["Standardized assessment", "Candidate comparison", "Interview insights"],
    },
    {
      title: "Certification Programs",
      description: "Create secure certification exams for professional development programs",
      icon: CheckCircle,
      benefits: ["Secure testing", "Certificate generation", "Skill validation"],
    },
  ]

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
            <Building2 className="w-4 h-4 mr-2" />
            Solutions for Every Need
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-white via-orange-200 to-red-200 bg-clip-text text-transparent">
              Tailored Solutions
            </span>
            <br />
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              for Every Organization
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            From universities to enterprises, CodeProctor adapts to your unique needs with customizable features and
            industry-specific solutions.
          </motion.p>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-8">
            {solutions.map((solution, index) => (
              <motion.div
                key={solution.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <CardHover>
                  <div className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-2xl p-8 h-full">
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${solution.gradient} rounded-2xl flex items-center justify-center mb-6`}
                    >
                      <solution.icon className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-4">{solution.title}</h3>
                    <p className="text-gray-300 mb-6">{solution.description}</p>

                    <div className="space-y-3 mb-8">
                      {solution.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-3">
                          <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                          </div>
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {Object.entries(solution.stats).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className="text-2xl font-bold text-orange-400">{value}</div>
                          <div className="text-xs text-gray-400 capitalize">{key.replace("_", " ")}</div>
                        </div>
                      ))}
                    </div>

                    <AnimatedButton colors={["#ea580c", "#dc2626", "#be185d"]} className="w-full py-3 group">
                      Learn More
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </AnimatedButton>
                  </div>
                </CardHover>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Powerful Features for Every Solution</h2>
            <p className="text-xl text-gray-300">
              Our comprehensive platform includes everything you need for secure coding assessments
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="text-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Common Use Cases</h2>
            <p className="text-xl text-gray-300">
              See how organizations use CodeProctor to solve their assessment challenges
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/5 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4">
                  <useCase.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{useCase.title}</h3>
                <p className="text-gray-300 mb-4">{useCase.description}</p>
                <div className="space-y-2">
                  {useCase.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-2.5 h-2.5 text-green-400" />
                      </div>
                      <span className="text-gray-400 text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-8"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Assessments?</h2>
            <p className="text-gray-300 mb-8">
              Let's discuss how CodeProctor can be customized for your specific needs and requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <AnimatedButton colors={["#ea580c", "#dc2626", "#be185d"]} className="px-8 py-3 group">
                Get Custom Demo
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </AnimatedButton>
              <button className="px-8 py-3 border border-white/20 rounded-lg text-white hover:bg-white/5 transition-colors">
                Contact Sales
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <MinimalistFooter />
    </div>
  )
}
