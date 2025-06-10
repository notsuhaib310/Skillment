"use client"
import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"
import { Code, BarChart3, Eye } from "lucide-react"

const stackItems = [
  {
    id: 1,
    number: "01",
    icon: Code,
    title: "AI-Powered Test Generation",
    description:
      "Save time and increase your efficiency by automating test case creation with our advanced AI algorithms that generate diverse coding challenges.",
    gradient: "from-orange-500 to-red-500",
  },
  {
    id: 2,
    number: "02",
    icon: Eye,
    title: "Real-Time Proctoring",
    description:
      "We help you maintain exam integrity with instant monitoring and AI-powered behavior analysis that detects suspicious activities in real-time.",
    gradient: "from-red-500 to-pink-500",
  },
  {
    id: 3,
    number: "03",
    icon: BarChart3,
    title: "Instant Analytics & Reports",
    description:
      "It offers comprehensive insights with its detailed performance analytics according to the specific needs of your assessment requirements.",
    gradient: "from-pink-500 to-purple-500",
  },
]

export const ScrollStack = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  return (
    <div ref={containerRef} className="relative py-20">
      <div className="max-w-8xl mx-auto px-6 lg:px-12 xl:px-16">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left side - Sticky content */}
          <div className="lg:sticky lg:top-32">
            <div className="mb-6">
              <span className="text-orange-400 text-sm font-semibold tracking-wider uppercase">How It Works</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">What Do We Bring to You?</h2>
            <p className="text-xl text-gray-300 leading-relaxed">
              All the innovative solutions you need to conduct secure coding exams are here! We add value to your
              assessment process with our features that simplify your workflow, increase efficiency and strengthen your
              decisions.
            </p>
          </div>

          {/* Right side - Vertical cards */}
          <div className="space-y-12">
            {stackItems.map((item, index) => (
              <FeatureCard key={item.id} item={item} index={index} scrollYProgress={scrollYProgress} />
            ))}
          </div>
        </div>
      </div>

      {/* Add extra space to allow scrolling */}
      <div className="h-[50vh]"></div>
    </div>
  )
}

const FeatureCard = ({
  item,
  index,
  scrollYProgress,
}: {
  item: (typeof stackItems)[0]
  index: number
  scrollYProgress: any
}) => {
  // Calculate the progress range for this card
  const progressStart = 0.1 + index * 0.2 // Stagger the start points
  const progressEnd = Math.min(1, progressStart + 0.3) // Overlap the animations slightly

  // Transform scroll progress to opacity and x position
  const opacity = useTransform(
    scrollYProgress,
    [progressStart - 0.1, progressStart, progressEnd, progressEnd + 0.1],
    [0.3, 1, 1, 0.8],
  )

  const xOffset = useTransform(scrollYProgress, [progressStart - 0.1, progressStart, progressEnd], [50, 0, 0])

  return (
    <motion.div
      style={{
        opacity,
        x: xOffset,
      }}
      className={cn(
        "bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-2xl p-8 transition-all duration-300",
        "shadow-lg hover:shadow-2xl",
      )}
    >
      {/* Background gradient effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-5 rounded-2xl`} />

      {/* Card content */}
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          {/* Icon */}
          <div
            className={`w-14 h-14 bg-gradient-to-r ${item.gradient} rounded-xl flex items-center justify-center mb-6`}
          >
            <item.icon className="w-7 h-7 text-white" />
          </div>

          {/* Content */}
          <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
          <p className="text-gray-300 leading-relaxed">{item.description}</p>
        </div>

        {/* Large number */}
        <div className="ml-8">
          <span className="text-6xl font-bold text-white/10 select-none">{item.number}</span>
        </div>
      </div>

      {/* Hover effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 hover:opacity-10 transition-opacity duration-300 rounded-2xl pointer-events-none`}
      />
    </motion.div>
  )
}
