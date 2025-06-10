"use client"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Code, Shield, Zap, CheckCircle, Play, ArrowRight, Brain, Eye, Lock, Camera, Monitor } from "lucide-react"

const showcaseItems = [
  {
    id: 1,
    title: "AI-Powered Code Editor",
    description: "Advanced IDE with intelligent suggestions and real-time error detection",
    image: "/placeholder.svg?height=400&width=600",
    icon: Code,
    gradient: "from-orange-500 to-red-500",
    features: [
      { icon: Brain, text: "AI-generated test cases" },
      { icon: Zap, text: "Real-time syntax validation" },
      { icon: CheckCircle, text: "Automated scoring" },
    ],
  },
  {
    id: 2,
    title: "Real-time Proctoring Dashboard",
    description: "Live monitoring with AI-powered behavior analysis and alerts",
    image: "/placeholder.svg?height=400&width=600",
    icon: Shield,
    gradient: "from-orange-500 to-red-500",
    features: [
      { icon: Eye, text: "Gaze tracking" },
      { icon: Lock, text: "Secure browser lockdown" },
      { icon: Camera, text: "AI behavior analysis" },
    ],
  },
  {
    id: 3,
    title: "Instant Analytics & Reports",
    description: "Comprehensive performance insights with detailed scoring breakdowns",
    image: "/placeholder.svg?height=400&width=600",
    icon: CheckCircle,
    gradient: "from-orange-500 to-red-500",
    features: [
      { icon: Monitor, text: "Real-time performance metrics" },
      { icon: Brain, text: "AI-powered insights" },
      { icon: Zap, text: "Instant feedback generation" },
    ],
  },
]

export const PlatformShowcase = ({ className }: { className?: string }) => {
  const [activeItem, setActiveItem] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [autoplayEnabled, setAutoplayEnabled] = useState(true)

  // Auto-rotate through items
  useEffect(() => {
    if (!autoplayEnabled) return

    const interval = setInterval(() => {
      setActiveItem((prev) => (prev + 1) % showcaseItems.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [autoplayEnabled])

  // Pause autoplay when hovering
  useEffect(() => {
    if (isHovered) {
      setAutoplayEnabled(false)
    } else {
      const timer = setTimeout(() => setAutoplayEnabled(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [isHovered])

  return (
    <div className={cn("relative max-w-8xl mx-auto", className)}>
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-red-600/10 to-orange-600/10 blur-3xl" />

      {/* Main showcase area */}
      <div className="relative">
        {/* Main image container */}
        <motion.div
          className="relative bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden"
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header with tabs */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <div className="w-3 h-3 bg-green-500 rounded-full" />
            </div>
            <div className="flex space-x-1 bg-black/30 rounded-lg p-1">
              {showcaseItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveItem(index)
                    setAutoplayEnabled(false)
                  }}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-all duration-300",
                    activeItem === index
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/10",
                  )}
                >
                  {item.title.split(" ")[0]}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm">Live</span>
            </div>
          </div>

          {/* Main content area */}
          <div className="relative h-[500px] overflow-hidden">
            {showcaseItems.map((item, index) => (
              <motion.div
                key={item.id}
                className="absolute inset-0"
                initial={{ opacity: 0, x: 100 }}
                animate={{
                  opacity: activeItem === index ? 1 : 0,
                  x: activeItem === index ? 0 : 100,
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <div className="relative h-full">
                  {/* Content grid */}
                  <div className="grid grid-cols-2 h-full">
                    {/* Left side - Feature description */}
                    <div className="p-8 flex flex-col justify-center">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        <div
                          className={`w-16 h-16 bg-gradient-to-r ${item.gradient} rounded-2xl flex items-center justify-center mb-6`}
                        >
                          <item.icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-4">{item.title}</h3>
                        <p className="text-gray-300 text-lg mb-8">{item.description}</p>

                        {/* Feature list */}
                        <div className="space-y-4">
                          {item.features.map((feature, idx) => (
                            <motion.div
                              key={idx}
                              className="flex items-center space-x-3"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.3 + idx * 0.1 }}
                            >
                              <div
                                className={`w-10 h-10 rounded-lg bg-gradient-to-r ${item.gradient} flex items-center justify-center`}
                              >
                                <feature.icon className="w-5 h-5 text-white" />
                              </div>
                              <span className="text-white">{feature.text}</span>
                            </motion.div>
                          ))}
                        </div>

                        <motion.button
                          className="mt-8 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 hover:shadow-lg transition-all duration-300 group"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span>Learn more</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                      </motion.div>
                    </div>

                    {/* Right side - Visual showcase */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-black to-zinc-900 flex items-center justify-center">
                      {/* Animated background elements */}
                      <div className="absolute inset-0">
                        <div className="absolute top-10 right-10 w-20 h-20 bg-orange-500/10 rounded-full blur-xl animate-pulse" />
                        <div className="absolute bottom-10 left-10 w-32 h-32 bg-red-500/10 rounded-full blur-xl animate-pulse" />
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl animate-pulse" />
                      </div>

                      {/* Feature-specific content */}
                      {index === 0 && (
                        <div className="relative z-10 w-4/5 h-4/5 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg p-6 overflow-hidden">
                          {/* Code editor mockup */}
                          <div className="flex items-center space-x-2 mb-4">
                            <div className="w-3 h-3 bg-red-500 rounded-full" />
                            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                            <div className="ml-4 text-xs text-gray-400">main.js</div>
                          </div>
                          <div className="font-mono text-sm">
                            <div className="text-gray-500">1</div>
                            <div>
                              <span className="text-purple-400">function</span>{" "}
                              <span className="text-orange-400">isPrime</span>
                              <span className="text-white">(n) {`{`}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">2</span>
                              <span className="ml-4 text-purple-400">if</span>
                              <span className="text-white"> (n &lt;= 1) </span>
                              <span className="text-purple-400">return</span>
                              <span className="text-orange-400"> false</span>
                              <span className="text-white">;</span>
                            </div>
                            <div>
                              <span className="text-gray-500">3</span>
                              <span className="ml-4 text-purple-400">for</span>
                              <span className="text-white"> (</span>
                              <span className="text-purple-400">let</span>
                              <span className="text-white"> i = 2; i &lt; n; i++) {`{`}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">4</span>
                              <span className="ml-8 text-purple-400">if</span>
                              <span className="text-white"> (n % i === 0) </span>
                              <span className="text-purple-400">return</span>
                              <span className="text-orange-400"> false</span>
                              <span className="text-white">;</span>
                            </div>
                            <div>
                              <span className="text-gray-500">5</span>
                              <span className="ml-4 text-white">{`}`}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">6</span>
                              <span className="ml-4 text-purple-400">return</span>
                              <span className="text-orange-400"> true</span>
                              <span className="text-white">;</span>
                            </div>
                            <div>
                              <span className="text-gray-500">7</span>
                              <span className="text-white">{`}`}</span>
                            </div>
                          </div>

                          {/* AI suggestion tooltip */}
                          <motion.div
                            className="absolute bottom-6 right-6 bg-orange-500/20 backdrop-blur-sm border border-orange-500/30 rounded-lg p-3 max-w-xs"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                          >
                            <div className="flex items-start space-x-2">
                              <Brain className="w-5 h-5 text-orange-400 mt-1 flex-shrink-0" />
                              <div>
                                <p className="text-orange-400 font-medium text-sm">AI Suggestion</p>
                                <p className="text-white text-xs">
                                  This algorithm can be optimized by checking only up to the square root of n.
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      )}

                      {index === 1 && (
                        <div className="relative z-10 w-4/5 h-4/5 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                          {/* Proctoring dashboard mockup */}
                          <div className="text-white font-medium mb-4">Proctoring Dashboard</div>
                          <div className="grid grid-cols-2 gap-4 h-[80%]">
                            <div className="bg-black/50 rounded-lg p-3 border border-white/5 relative">
                              <div className="absolute top-2 right-2 flex items-center">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1" />
                                <span className="text-red-400 text-xs">Recording</span>
                              </div>
                              <div className="h-full flex items-center justify-center">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 flex items-center justify-center">
                                  <Camera className="w-8 h-8 text-orange-400" />
                                </div>
                              </div>
                              <div className="absolute bottom-2 left-2 right-2 bg-black/70 rounded-md p-1 text-xs text-white">
                                Webcam Feed
                              </div>
                            </div>
                            <div className="bg-black/50 rounded-lg p-3 border border-white/5 relative">
                              <div className="absolute top-2 right-2 flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
                                <span className="text-green-400 text-xs">Secure</span>
                              </div>
                              <div className="h-full flex items-center justify-center">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 flex items-center justify-center">
                                  <Monitor className="w-8 h-8 text-orange-400" />
                                </div>
                              </div>
                              <div className="absolute bottom-2 left-2 right-2 bg-black/70 rounded-md p-1 text-xs text-white">
                                Screen Recording
                              </div>
                            </div>
                          </div>

                          {/* AI alert */}
                          <motion.div
                            className="absolute bottom-6 right-6 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-lg p-3 max-w-xs"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                          >
                            <div className="flex items-start space-x-2">
                              <Eye className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                              <div>
                                <p className="text-red-400 font-medium text-sm">AI Alert</p>
                                <p className="text-white text-xs">
                                  Suspicious behavior detected: Multiple browser tabs opened.
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      )}

                      {index === 2 && (
                        <div className="relative z-10 w-4/5 h-4/5 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                          {/* Analytics dashboard mockup */}
                          <div className="text-white font-medium mb-4">Performance Analytics</div>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg p-3">
                              <div className="text-orange-400 text-2xl font-bold">98%</div>
                              <div className="text-gray-300 text-sm">Test Completion</div>
                            </div>
                            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg p-3">
                              <div className="text-orange-400 text-2xl font-bold">A+</div>
                              <div className="text-gray-300 text-sm">Overall Grade</div>
                            </div>
                          </div>

                          {/* Chart mockup */}
                          <div className="bg-black/50 rounded-lg p-3 border border-white/5 h-40 mb-4 relative overflow-hidden">
                            <div className="absolute bottom-0 left-0 right-0 h-32">
                              <div className="absolute bottom-0 left-[10%] w-4 h-20 bg-orange-500/70 rounded-t-md"></div>
                              <div className="absolute bottom-0 left-[25%] w-4 h-28 bg-orange-500/70 rounded-t-md"></div>
                              <div className="absolute bottom-0 left-[40%] w-4 h-16 bg-orange-500/70 rounded-t-md"></div>
                              <div className="absolute bottom-0 left-[55%] w-4 h-24 bg-orange-500/70 rounded-t-md"></div>
                              <div className="absolute bottom-0 left-[70%] w-4 h-12 bg-orange-500/70 rounded-t-md"></div>
                              <div className="absolute bottom-0 left-[85%] w-4 h-32 bg-orange-500/70 rounded-t-md"></div>
                            </div>
                            <div className="absolute top-2 left-2 text-xs text-gray-400">Performance by Question</div>
                          </div>

                          {/* AI insight */}
                          <motion.div
                            className="absolute bottom-6 right-6 bg-orange-500/20 backdrop-blur-sm border border-orange-500/30 rounded-lg p-3 max-w-xs"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                          >
                            <div className="flex items-start space-x-2">
                              <Brain className="w-5 h-5 text-orange-400 mt-1 flex-shrink-0" />
                              <div>
                                <p className="text-orange-400 font-medium text-sm">AI Insight</p>
                                <p className="text-white text-xs">
                                  Student shows strong algorithm skills but needs improvement in data structures.
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Navigation dots */}
        <div className="flex justify-center mt-8 space-x-2">
          {showcaseItems.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveItem(index)
                setAutoplayEnabled(false)
              }}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                activeItem === index
                  ? "bg-gradient-to-r from-orange-500 to-red-500 scale-125"
                  : "bg-white/30 hover:bg-white/50",
              )}
            />
          ))}
        </div>
      </div>

      {/* Feature highlights */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-6xl mx-auto">
        <motion.div className="text-center group" whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">AI Test Cases</h3>
          <p className="text-gray-400 text-sm">Automatically generate diverse test cases</p>
        </motion.div>

        <motion.div className="text-center group" whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Real-time Proctoring</h3>
          <p className="text-gray-400 text-sm">Advanced AI-powered monitoring</p>
        </motion.div>

        <motion.div className="text-center group" whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Code className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Multi-Language Support</h3>
          <p className="text-gray-400 text-sm">20+ programming languages supported</p>
        </motion.div>

        <motion.div className="text-center group" whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Instant Results</h3>
          <p className="text-gray-400 text-sm">Automated scoring with detailed feedback</p>
        </motion.div>
      </div>

      {/* CTA Section */}
      <motion.div
        className="text-center mt-20 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center space-x-2 mx-auto hover:shadow-2xl transition-all duration-300 group">
          <Play className="w-5 h-5" />
          <span>Experience the Platform</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>
    </div>
  )
}

export default PlatformShowcase
