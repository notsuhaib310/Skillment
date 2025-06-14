"use client"
import { motion } from "framer-motion"
import { Code, Play, Terminal, ArrowRight } from "lucide-react"
import { AnimatedButton } from "./animated-button"
import Link from "next/link"

export const CompilerPromo = () => {
  return (
    <div className="relative py-20">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full text-orange-400 text-sm font-medium border border-orange-500/30 mb-6"
          >
            <Code className="w-4 h-4 mr-2" />
            Try It Yourself
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Experience Our Online Compiler
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Write, run, and test your code directly in the browser with our powerful online compiler. Support for
            multiple languages, real-time execution, and advanced features.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Compiler Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative"
          >
            <div className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6 overflow-hidden">
              {/* Header */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <div className="ml-4 text-xs text-gray-400">main.py</div>
              </div>

              {/* Code Preview */}
              <div className="font-mono text-sm mb-4">
                <div className="flex">
                  <span className="text-gray-500 w-8">1</span>
                  <span className="text-purple-400">def</span>
                  <span className="text-orange-400 ml-2">fibonacci</span>
                  <span className="text-white">(n):</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-8">2</span>
                  <span className="text-white ml-4">if n &lt;= 1:</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-8">3</span>
                  <span className="text-white ml-8">return n</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-8">4</span>
                  <span className="text-white ml-4">return fibonacci(n-1) + fibonacci(n-2)</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-8">5</span>
                  <span className="text-white"></span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-8">6</span>
                  <span className="text-purple-400">for</span>
                  <span className="text-white ml-2">i in range(10):</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-8">7</span>
                  <span className="text-white ml-4">print(fibonacci(i))</span>
                </div>
              </div>

              {/* Terminal Output */}
              <div className="bg-black/50 rounded-lg p-3 font-mono text-sm">
                <div className="text-green-400">0</div>
                <div className="text-green-400">1</div>
                <div className="text-green-400">1</div>
                <div className="text-green-400">2</div>
                <div className="text-green-400">3</div>
                <div className="text-green-400">5</div>
                <div className="text-green-400">8</div>
                <div className="text-green-400">13</div>
                <div className="text-green-400">21</div>
                <div className="text-green-400">34</div>
              </div>

              {/* Run Button */}
              <div className="flex justify-center mt-4">
                <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2">
                  <Play className="w-4 h-4" />
                  <span>Run Code</span>
                </button>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-orange-500/20 rounded-full blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-red-500/20 rounded-full blur-xl" />
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Multiple Languages</h3>
                  <p className="text-gray-300">
                    Write and execute code in Python, Java, and more programming languages with full syntax highlighting
                    and error detection.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Terminal className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Real-Time Execution</h3>
                  <p className="text-gray-300">
                    Run your code instantly in the browser with our secure execution environment. See results
                    immediately with no setup required.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Play className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Advanced Features</h3>
                  <p className="text-gray-300">
                    Code snippets, auto-save, keyboard shortcuts, and more to enhance your coding experience and boost
                    productivity.
                  </p>
                </div>
              </div>
            </div>

            <Link href="/compiler" passHref>
              <AnimatedButton colors={["#ea580c", "#dc2626", "#be185d"]} className="px-8 py-3 text-lg group">
                Try Online Compiler
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </AnimatedButton>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
