"use client"
import { useState } from "react"
import { Code, Github, Twitter, Linkedin, Facebook } from "lucide-react"
import { motion } from "framer-motion"

export const MinimalistFooter = () => {
  const [email, setEmail] = useState("")

  return (
    <div className="bg-black py-16">
      {/* Newsletter Subscription */}
      <div className="max-w-3xl mx-auto mb-20 px-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="email"
            placeholder="contact@skillment.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-zinc-800/70 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
          >
            Subscribe
          </motion.button>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-zinc-900/80 backdrop-blur-sm border border-white/5 rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Skillment</span>
              </div>
              <p className="text-gray-400 text-sm">
                Meet our AI-powered coding exam solution to lighten your workload, increase efficiency and make more
                accurate assessments.
              </p>
            </div>

            {/* Contact Links */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Contact</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Github
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Instagram
                  </a>
                </li>
              </ul>
            </div>

            {/* Platforms */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Platforms</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Web
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    iOS
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Android
                  </a>
                </li>
              </ul>
            </div>

            {/* Help */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Help</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Feedback
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <div>© 2024 | Skillment</div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-white transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
