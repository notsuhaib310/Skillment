"use client"
import { motion } from "framer-motion"
import { Shield, Eye, Lock, Code, Camera, Monitor, Fingerprint, Database, Server } from "lucide-react"

const securityFeatures = [
  {
    icon: Eye,
    title: "AI Proctoring",
    description: "Advanced AI monitoring with gaze tracking and behavior analysis",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Lock,
    title: "Secure Browser",
    description: "Lockdown browser integration prevents unauthorized access",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Camera,
    title: "Webcam Monitor",
    description: "Real-time video surveillance with AI-powered anomaly detection",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Monitor,
    title: "Screen Recording",
    description: "Full screen capture with intelligent activity monitoring",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Code,
    title: "Code Analysis",
    description: "Advanced plagiarism detection and code similarity checking",
    color: "from-indigo-500 to-blue-500",
  },
  {
    icon: Fingerprint,
    title: "Identity Verification",
    description: "Biometric authentication ensures candidate identity",
    color: "from-teal-500 to-green-500",
  },
  {
    icon: Database,
    title: "Encrypted Storage",
    description: "End-to-end encryption for all exam data and submissions",
    color: "from-red-500 to-pink-500",
  },
  {
    icon: Server,
    title: "Secure Infrastructure",
    description: "SOC 2 compliant infrastructure with regular security audits",
    color: "from-amber-500 to-orange-500",
  },
]

export const EnhancedSecurity = () => {
  return (
    <div className="relative">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

        {/* Security grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        {/* Central shield */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 opacity-5"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.05 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
        >
          <Shield className="w-full h-full text-orange-500" />
        </motion.div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-8xl mx-auto px-6 lg:px-12 xl:px-16 py-20">
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full text-orange-400 text-sm font-medium border border-orange-500/30 mb-6"
          >
            <Shield className="w-4 h-4 mr-2" />
            Enterprise-Grade Security
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Integrated Security & Safety Tools
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Our comprehensive security suite ensures exam integrity with multiple layers of protection, from AI-powered
            monitoring to encrypted data storage.
          </motion.p>
        </div>

        {/* Central security diagram */}
        <div className="relative mb-24">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="relative bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 overflow-hidden">
              {/* Central shield */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center">
                <Shield className="w-20 h-20 text-orange-400" />
              </div>

              {/* Connecting lines */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 400">
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.3" />
                  </linearGradient>
                </defs>

                {/* Radial lines connecting to center */}
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}>
                  <line x1="150" y1="100" x2="400" y2="200" stroke="url(#lineGradient)" strokeWidth="2" />
                  <line x1="650" y1="100" x2="400" y2="200" stroke="url(#lineGradient)" strokeWidth="2" />
                  <line x1="150" y1="300" x2="400" y2="200" stroke="url(#lineGradient)" strokeWidth="2" />
                  <line x1="650" y1="300" x2="400" y2="200" stroke="url(#lineGradient)" strokeWidth="2" />
                </motion.g>

                {/* Animated pulse circles */}
                {[100, 200, 300].map((radius, i) => (
                  <motion.circle
                    key={i}
                    cx="400"
                    cy="200"
                    r={radius}
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="1"
                    initial={{ opacity: 0.8, scale: 0.8 }}
                    animate={{ opacity: 0, scale: 1.2 }}
                    transition={{
                      duration: 4,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 1.3,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </svg>

              {/* Corner security features */}
              <div className="grid grid-cols-2 gap-y-16 gap-x-32 py-10">
                <motion.div
                  className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl p-4"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">AI Proctoring</h3>
                      <p className="text-xs text-gray-400">Advanced monitoring</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl p-4"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <Lock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Secure Browser</h3>
                      <p className="text-xs text-gray-400">Lockdown protection</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl p-4"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Webcam Monitor</h3>
                      <p className="text-xs text-gray-400">Video surveillance</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl p-4"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <Code className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Code Analysis</h3>
                      <p className="text-xs text-gray-400">Plagiarism detection</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Security features grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              className="group relative"
            >
              <div
                className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl blur-xl"
                style={{
                  background: `linear-gradient(to right, ${feature.color.split(" ")[1]}, ${feature.color.split(" ")[3]})`,
                }}
              />
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group-hover:scale-[1.02]">
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300 text-sm">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Security certification badges */}
        <div className="mt-20 text-center">
          <p className="text-gray-400 mb-8">Trusted by leading security providers worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {["SOC 2", "ISO 27001", "GDPR", "FERPA", "CCPA"].map((cert, index) => (
              <motion.div
                key={cert}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-6 py-3 flex items-center space-x-2"
              >
                <Shield className="w-4 h-4 text-orange-400" />
                <span className="text-white font-medium">{cert}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
