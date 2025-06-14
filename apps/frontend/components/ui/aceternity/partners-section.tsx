"use client"
import { motion } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { ArrowRight, Check, ExternalLink } from "lucide-react"

const partners = [
  {
    name: "Harvard University",
    logo: "/placeholder.svg?height=60&width=180",
    category: "education",
  },
  {
    name: "Stanford University",
    logo: "/placeholder.svg?height=60&width=180",
    category: "education",
  },
  {
    name: "MIT",
    logo: "/placeholder.svg?height=60&width=180",
    category: "education",
  },
  {
    name: "Google",
    logo: "/placeholder.svg?height=60&width=180",
    category: "tech",
  },
  {
    name: "Microsoft",
    logo: "/placeholder.svg?height=60&width=180",
    category: "tech",
  },
  {
    name: "Amazon",
    logo: "/placeholder.svg?height=60&width=180",
    category: "tech",
  },
  {
    name: "Udacity",
    logo: "/placeholder.svg?height=60&width=180",
    category: "education",
  },
  {
    name: "Coursera",
    logo: "/placeholder.svg?height=60&width=180",
    category: "education",
  },
  {
    name: "edX",
    logo: "/placeholder.svg?height=60&width=180",
    category: "education",
  },
  {
    name: "IBM",
    logo: "/placeholder.svg?height=60&width=180",
    category: "tech",
  },
  {
    name: "Oracle",
    logo: "/placeholder.svg?height=60&width=180",
    category: "tech",
  },
  {
    name: "Salesforce",
    logo: "/placeholder.svg?height=60&width=180",
    category: "tech",
  },
]

const techStack = [
  {
    name: "React",
    logo: "/placeholder.svg?height=60&width=60",
    category: "frontend",
  },
  {
    name: "Next.js",
    logo: "/placeholder.svg?height=60&width=60",
    category: "frontend",
  },
  {
    name: "TypeScript",
    logo: "/placeholder.svg?height=60&width=60",
    category: "language",
  },
  {
    name: "Python",
    logo: "/placeholder.svg?height=60&width=60",
    category: "language",
  },
  {
    name: "Node.js",
    logo: "/placeholder.svg?height=60&width=60",
    category: "backend",
  },
  {
    name: "MongoDB",
    logo: "/placeholder.svg?height=60&width=60",
    category: "database",
  },
  {
    name: "PostgreSQL",
    logo: "/placeholder.svg?height=60&width=60",
    category: "database",
  },
  {
    name: "Docker",
    logo: "/placeholder.svg?height=60&width=60",
    category: "devops",
  },
  {
    name: "AWS",
    logo: "/placeholder.svg?height=60&width=60",
    category: "cloud",
  },
  {
    name: "TensorFlow",
    logo: "/placeholder.svg?height=60&width=60",
    category: "ai",
  },
  {
    name: "PyTorch",
    logo: "/placeholder.svg?height=60&width=60",
    category: "ai",
  },
  {
    name: "Kubernetes",
    logo: "/placeholder.svg?height=60&width=60",
    category: "devops",
  },
]

const integrations = [
  {
    name: "Canvas LMS",
    description: "Seamlessly integrate assessments with your Canvas courses",
    logo: "/placeholder.svg?height=80&width=80",
    features: ["Grade sync", "Single sign-on", "Course roster import", "Assignment creation"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Blackboard",
    description: "Connect Skillment directly to your Blackboard environment",
    logo: "/placeholder.svg?height=80&width=80",
    features: ["Automated grading", "Student analytics", "Course integration", "Custom branding"],
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Moodle",
    description: "Enhance your Moodle platform with advanced coding assessments",
    logo: "/placeholder.svg?height=80&width=80",
    features: ["Open-source plugin", "Custom workflows", "Detailed reporting", "API access"],
    color: "from-orange-500 to-red-500",
  },
  {
    name: "GitHub Classroom",
    description: "Integrate with GitHub for seamless code submission and review",
    logo: "/placeholder.svg?height=80&width=80",
    features: ["Repository integration", "Commit history", "Pull request grading", "Code review tools"],
    color: "from-green-500 to-teal-500",
  },
]

export const PartnersSection = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeTechCategory, setActiveTechCategory] = useState<string | null>(null)
  const [activeIntegration, setActiveIntegration] = useState(0)

  const filteredPartners = activeCategory ? partners.filter((partner) => partner.category === activeCategory) : partners
  const filteredTechStack = activeTechCategory
    ? techStack.filter((tech) => tech.category === activeTechCategory)
    : techStack

  return (
    <div className="relative py-20">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-8xl mx-auto px-6 lg:px-12 xl:px-16">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full text-orange-400 text-sm font-medium border border-orange-500/30 mb-6"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Trusted Worldwide
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Powerful Integrations & Trusted Partners
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-300"
          >
            Skillment seamlessly connects with your existing tools and is trusted by leading institutions worldwide
          </motion.p>
        </div>

        {/* Partners Showcase */}
        <div className="mb-20">
          <div className="flex justify-center mb-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-full p-1 flex flex-wrap justify-center">
              <button
                onClick={() => setActiveCategory(null)}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  activeCategory === null
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                    : "text-gray-400 hover:text-white",
                )}
              >
                All
              </button>
              <button
                onClick={() => setActiveCategory("education")}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  activeCategory === "education"
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                    : "text-gray-400 hover:text-white",
                )}
              >
                Education
              </button>
              <button
                onClick={() => setActiveCategory("tech")}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  activeCategory === "tech"
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                    : "text-gray-400 hover:text-white",
                )}
              >
                Tech
              </button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
          >
            {filteredPartners.map((partner, index) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 flex items-center justify-center hover:bg-white/10 transition-all duration-300 group"
              >
                <img
                  src={partner.logo || "/placeholder.svg"}
                  alt={partner.name}
                  className="max-h-12 opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Tech Stack Showcase */}
        <div className="mt-32 mb-20">
          <div className="text-center mb-16">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-white mb-4"
            >
              Powered by Modern Tech Stack
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-gray-300 max-w-2xl mx-auto"
            >
              Built with cutting-edge technologies for performance, security, and scalability
            </motion.p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-full p-1 flex flex-wrap justify-center gap-1">
              <button
                onClick={() => setActiveTechCategory(null)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  activeTechCategory === null
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                    : "text-gray-400 hover:text-white",
                )}
              >
                All
              </button>
              <button
                onClick={() => setActiveTechCategory("frontend")}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  activeTechCategory === "frontend"
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                    : "text-gray-400 hover:text-white",
                )}
              >
                Frontend
              </button>
              <button
                onClick={() => setActiveTechCategory("backend")}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  activeTechCategory === "backend"
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                    : "text-gray-400 hover:text-white",
                )}
              >
                Backend
              </button>
              <button
                onClick={() => setActiveTechCategory("language")}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  activeTechCategory === "language"
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                    : "text-gray-400 hover:text-white",
                )}
              >
                Languages
              </button>
              <button
                onClick={() => setActiveTechCategory("database")}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  activeTechCategory === "database"
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                    : "text-gray-400 hover:text-white",
                )}
              >
                Databases
              </button>
              <button
                onClick={() => setActiveTechCategory("ai")}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  activeTechCategory === "ai"
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                    : "text-gray-400 hover:text-white",
                )}
              >
                AI/ML
              </button>
              <button
                onClick={() => setActiveTechCategory("devops")}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  activeTechCategory === "devops"
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                    : "text-gray-400 hover:text-white",
                )}
              >
                DevOps
              </button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6"
          >
            {filteredTechStack.map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.05 * index }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-white/10 transition-all duration-300 group"
              >
                <img
                  src={tech.logo || "/placeholder.svg"}
                  alt={tech.name}
                  className="h-12 w-12 mb-2 opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                />
                <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{tech.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Integrations Showcase */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-white mb-4"
            >
              Seamless Integrations
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-gray-300 max-w-2xl mx-auto"
            >
              Connect Skillment with your favorite tools and platforms
            </motion.p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Integration Selector */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4"
            >
              {integrations.map((integration, index) => (
                <div
                  key={integration.name}
                  className={cn(
                    "bg-white/5 backdrop-blur-sm border rounded-xl p-4 cursor-pointer transition-all duration-300",
                    activeIntegration === index
                      ? "border-orange-500/50 bg-white/10 scale-105"
                      : "border-white/10 hover:border-white/20",
                  )}
                  onClick={() => setActiveIntegration(index)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                      <img src={integration.logo || "/placeholder.svg"} alt={integration.name} className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{integration.name}</h4>
                      <p className="text-gray-400 text-sm">{integration.description}</p>
                    </div>
                  </div>
                </div>
              ))}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6 w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 hover:shadow-lg transition-all duration-300 group"
              >
                <span>View All Integrations</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>

            {/* Integration Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative"
            >
              <div className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-3xl p-8 overflow-hidden">
                {/* Integration Header */}
                <div className="flex items-center space-x-4 mb-8">
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${integrations[activeIntegration].color} rounded-2xl flex items-center justify-center`}
                  >
                    <img
                      src={integrations[activeIntegration].logo || "/placeholder.svg"}
                      alt={integrations[activeIntegration].name}
                      className="w-10 h-10"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{integrations[activeIntegration].name}</h3>
                    <p className="text-gray-300">{integrations[activeIntegration].description}</p>
                  </div>
                </div>

                {/* Integration Features */}
                <div className="space-y-4 mb-8">
                  {integrations[activeIntegration].features.map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                      className="flex items-start space-x-3"
                    >
                      <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-green-400" />
                      </div>
                      <span className="text-gray-300">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Integration CTA */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white/10 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 hover:bg-white/20 transition-all duration-300 group border border-white/10"
                >
                  <span>Learn More About This Integration</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                {/* Background elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-orange-500/20 rounded-full blur-xl" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-red-500/20 rounded-full blur-xl" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
