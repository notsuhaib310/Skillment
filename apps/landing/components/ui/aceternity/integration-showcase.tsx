"use client"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Shield, Eye, Lock, Code, Camera, Monitor } from "lucide-react"

const integrations = [
  {
    name: "AI Proctoring",
    icon: Eye,
    description: "Advanced AI monitoring",
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Secure Browser",
    icon: Lock,
    description: "Lockdown browser integration",
    color: "from-green-500 to-emerald-500",
  },
  {
    name: "Webcam Monitor",
    icon: Camera,
    description: "Real-time video surveillance",
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Screen Recording",
    icon: Monitor,
    description: "Full screen capture",
    color: "from-orange-500 to-red-500",
  },
  {
    name: "Code Analysis",
    icon: Code,
    description: "Plagiarism detection",
    color: "from-indigo-500 to-blue-500",
  },
  {
    name: "Identity Verification",
    icon: Shield,
    description: "Biometric authentication",
    color: "from-teal-500 to-green-500",
  },
]

export const IntegrationShowcase = ({ className }: { className?: string }) => {
  return (
    <div className={cn("relative", className)}>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {integrations.map((integration, idx) => (
          <motion.div
            key={integration.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="group relative"
          >
            <div
              className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl blur-xl"
              style={{
                background: `linear-gradient(to right, ${integration.color.split(" ")[1]}, ${integration.color.split(" ")[3]})`,
              }}
            />
            <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 group-hover:scale-105">
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-r ${integration.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <integration.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">{integration.name}</h3>
              <p className="text-gray-300 text-sm">{integration.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Central connecting lines */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full opacity-20">
          <defs>
            <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
          {/* Add connecting lines between integration points */}
          <motion.path
            d="M 200,150 Q 400,100 600,150"
            stroke="url(#line-gradient)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 1 }}
          />
          <motion.path
            d="M 150,300 Q 400,250 650,300"
            stroke="url(#line-gradient)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 1.5 }}
          />
        </svg>
      </div>
    </div>
  )
}
