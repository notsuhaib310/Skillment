"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

const stats = [
  { number: 10000, suffix: "+", label: "Students Tested" },
  { number: 500, suffix: "+", label: "Universities" },
  { number: 99.9, suffix: "%", label: "Uptime" },
  { number: 24, suffix: "/7", label: "Support" },
]

export const StatsCounter = () => {
  const [counts, setCounts] = useState(stats.map(() => 0))

  useEffect(() => {
    const timers = stats.map((stat, index) => {
      const increment = stat.number / 100
      let current = 0
      return setInterval(() => {
        current += increment
        if (current >= stat.number) {
          current = stat.number
          clearInterval(timers[index])
        }
        setCounts((prev) => {
          const newCounts = [...prev]
          newCounts[index] = current
          return newCounts
        })
      }, 20)
    })

    return () => timers.forEach((timer) => clearInterval(timer))
  }, [])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="text-center"
        >
          <div className="text-3xl md:text-4xl font-bold text-white mb-2">
            {Math.floor(counts[index])}
            {stat.suffix}
          </div>
          <div className="text-gray-400">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  )
}
