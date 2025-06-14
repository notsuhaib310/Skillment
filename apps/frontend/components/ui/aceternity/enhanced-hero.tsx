"use client"
import { motion } from "framer-motion"
import { Sparkles, Code, Shield, Zap, CheckCircle } from "lucide-react"
import { StatsCounter } from "./stats-counter"
import { EnhancedCTA } from "./enhanced-cta"
import { TypewriterEffect } from "./typewriter-effect"

const floatingElements = [
  { icon: Code, position: "top-20 left-20", delay: 0 },
  { icon: Shield, position: "top-32 right-32", delay: 0.2 },
  { icon: Zap, position: "bottom-40 left-32", delay: 0.4 },
  { icon: CheckCircle, position: "bottom-20 right-20", delay: 0.6 },
]

export const EnhancedHero = () => {
  return (
    <div className="relative min-h-screen pt-28 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Large gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-full blur-3xl" />

        {/* Floating icons */}
        {floatingElements.map((element, index) => (
          <motion.div
            key={index}
            className={`absolute ${element.position} hidden lg:block`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.3, y: 0 }}
            transition={{ duration: 1, delay: element.delay }}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
              <element.icon className="w-8 h-8 text-orange-400" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-8xl mx-auto px-6 lg:px-12 xl:px-16 py-20">
        <div className="grid lg:grid-cols-12 gap-8 items-center min-h-[80vh]">
          {/* Left side - Main content */}
          <div className="lg:col-span-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="mb-6">
                <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full text-orange-400 text-sm font-medium border border-orange-500/30">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI-Powered Assessment Platform
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-8 leading-tight">
                <span className="bg-gradient-to-r from-white via-orange-200 to-red-200 bg-clip-text text-transparent">
                  Coding Exams
                </span>
                <br />
                <span className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl flex items-center flex-wrap">
                  That{" "}
                  <TypewriterEffect
                    words={[
                      {
                        text: "Can't Be Cheated",
                        className:
                          "bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent",
                      },
                      {
                        text: "Are Secure",
                        className:
                          "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent",
                      },
                      {
                        text: "Use AI Power",
                        className:
                          "bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 bg-clip-text text-transparent",
                      },
                    ]}
                    className="ml-4"
                    cursorClassName="h-8 md:h-10 lg:h-12 xl:h-14"
                  />
                </span>
              </h1>

              <p className="text-xl md:text-2xl lg:text-3xl text-gray-300 mb-12 leading-relaxed max-w-3xl">
                Revolutionize your coding assessments with AI-generated test cases, real-time proctoring, and instant
                feedback. Perfect for universities, bootcamps, and tech recruiters.
              </p>

              {/* Enhanced CTA Section */}
              <EnhancedCTA className="mb-16" />

              {/* Key features list */}
              <div className="grid sm:grid-cols-2 gap-4 mb-12">
                {[
                  "AI-Generated Test Cases",
                  "Real-time Proctoring",
                  "20+ Programming Languages",
                  "Instant Feedback & Analytics",
                ].map((feature, index) => (
                  <motion.div
                    key={feature}
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  >
                    <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-300">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right side - Visual showcase */}
          <div className="lg:col-span-6">
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              {/* Main showcase card */}
              <div className="relative bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-3xl p-8 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                  </div>
                  <div className="flex items-center space-x-2 text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm">Live Exam</span>
                  </div>
                </div>

                {/* Code editor mockup */}
                <div className="bg-black/60 rounded-lg p-6 mb-6">
                  <div className="font-mono text-sm space-y-2">
                    <div className="flex">
                      <span className="text-gray-500 w-8">1</span>
                      <span className="text-purple-400">function</span>
                      <span className="text-white ml-2">isPalindrome</span>
                      <span className="text-yellow-400">(str)</span>
                      <span className="text-white"> {`{`}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-8">2</span>
                      <span className="text-white ml-4">const cleaned = str.toLowerCase();</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-8">3</span>
                      <span className="text-purple-400 ml-4">return</span>
                      <span className="text-white ml-2">cleaned === cleaned.split('').reverse().join('');</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-8">4</span>
                      <span className="text-white">{`}`}</span>
                    </div>
                  </div>
                </div>

                {/* AI feedback */}
                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg p-4 border border-orange-500/30">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-orange-400 font-medium text-sm">AI Feedback</p>
                      <p className="text-white text-sm">Great solution! Consider edge cases like empty strings.</p>
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-orange-500/20 rounded-full blur-xl animate-pulse" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-red-500/20 rounded-full blur-xl animate-pulse" />
              </div>

              {/* Floating stats cards */}
              <motion.div
                className="absolute -top-6 -left-6 bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
              >
                <div className="text-2xl font-bold text-orange-400">98%</div>
                <div className="text-gray-300 text-sm">Accuracy Rate</div>
              </motion.div>

              <motion.div
                className="absolute -bottom-6 -right-6 bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              >
                <div className="text-2xl font-bold text-red-400">2.5s</div>
                <div className="text-gray-300 text-sm">Avg Response</div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Stats Counter */}
        <motion.div
          className="mt-20 pt-20 border-t border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          <StatsCounter />
        </motion.div>
      </div>
    </div>
  )
}
