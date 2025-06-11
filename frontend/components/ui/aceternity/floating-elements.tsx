"use client"
import { useEffect, useState } from "react"
import type React from "react"

import { cn } from "@/lib/utils"

export const FloatingElements = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className={cn("relative", className)}>
      {/* Floating orbs */}
      <div
        className="absolute w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
        style={{
          transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
          transition: "transform 0.5s ease-out",
        }}
      />
      <div
        className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
        style={{
          transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * -0.01}px)`,
          transition: "transform 0.8s ease-out",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
