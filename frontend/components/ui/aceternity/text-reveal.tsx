"use client"
import type React from "react"
import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export const TextReveal = ({
  children,
  className,
  revealText,
  revealClassName,
}: {
  children: React.ReactNode
  className?: string
  revealText?: string
  revealClassName?: string
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (textRef.current) {
              textRef.current.classList.add("animate-text-reveal")
            }
          }
        })
      },
      { threshold: 0.1 },
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current)
      }
    }
  }, [])

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)}>
      <div ref={textRef} className={cn("transform translate-y-full opacity-0", revealClassName)}>
        {revealText || children}
      </div>
      <div className="absolute inset-0 opacity-0">{children}</div>
    </div>
  )
}
