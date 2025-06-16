"use client"
import type React from "react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

export const Spotlight = ({
  children,
  className = "",
  size = 600,
}: {
  children: React.ReactNode
  className?: string
  size?: number
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setOpacity(1)
  }

  const handleMouseLeave = () => {
    setOpacity(0)
  }

  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
        setOpacity(1)
      } else {
        setOpacity(0)
      }
    }

    window.addEventListener("mousemove", handleWindowMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(circle ${size}px at ${position.x}px ${position.y}px, rgba(120, 180, 255, 0.15), transparent 80%)`,
        }}
      />
      {children}
    </div>
  )
}
