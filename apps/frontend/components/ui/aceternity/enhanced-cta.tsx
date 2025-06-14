"use client"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { ArrowRight, Play, Sparkles } from "lucide-react"

export const EnhancedCTA = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex flex-col sm:flex-row gap-6 justify-center items-center", className)}>
      {/* Primary CTA */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
        <button className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center space-x-2 hover:shadow-2xl transition-all duration-300">
          <Play className="w-5 h-5" />
          <span>Try Demo</span>
          <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}>
            <ArrowRight className="w-5 h-5" />
          </motion.div>
        </button>
      </motion.div>

      {/* Secondary CTA */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative group">
        <div className="absolute inset-0 border-2 border-white/30 rounded-full" />
        <div className="absolute inset-0 bg-white/5 rounded-full backdrop-blur-sm" />
        <button className="relative text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center space-x-2 hover:bg-white/10 transition-all duration-300">
          <Sparkles className="w-5 h-5" />
          <span>Book a Demo</span>
        </button>
      </motion.div>
    </div>
  )
}
