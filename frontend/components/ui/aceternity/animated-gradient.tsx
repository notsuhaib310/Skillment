"use client"
import { cn } from "@/lib/utils"
import type React from "react"
import { useEffect, useRef, useState } from "react"

export const AnimatedGradient = ({
  children,
  className,
  containerClassName,
  colors,
  duration = 10,
  blur = 100,
  interactive = true,
  width = 1000,
  height = 1000,
}: {
  children?: React.ReactNode
  className?: string
  containerClassName?: string
  colors?: string[]
  duration?: number
  blur?: number
  interactive?: boolean
  width?: number
  height?: number
}) => {
  const interactiveRef = useRef<HTMLDivElement>(null)
  const [curX, setCurX] = useState(0)
  const [curY, setCurY] = useState(0)
  const [tgX, setTgX] = useState(0)
  const [tgY, setTgY] = useState(0)

  useEffect(() => {
    document.body.style.setProperty("--gradient-background-start", "0%")
    document.body.style.setProperty("--gradient-background-end", "100%")
  }, [])

  useEffect(() => {
    if (!interactive) return
    const move = () => {
      setCurX((curX) => curX + (tgX - curX) * 0.1)
      setCurY((curY) => curY + (tgY - curY) * 0.1)
      if (interactiveRef.current) {
        interactiveRef.current.style.transform = `translate(${curX}px, ${curY}px)`
      }
      requestAnimationFrame(move)
    }
    move()
  }, [interactive, tgX, tgY])

  const defaultColors = [
    "rgba(15, 32, 39, 0.8)",
    "rgba(32, 58, 67, 0.8)",
    "rgba(44, 83, 100, 0.8)",
    "rgba(15, 32, 39, 0.8)",
  ]

  return (
    <div
      className={cn("relative overflow-hidden", containerClassName)}
      style={{ width: "100%", height: "100%" }}
      onMouseMove={(e) => {
        if (!interactive || !interactiveRef.current) return
        const rect = interactiveRef.current.getBoundingClientRect()
        setTgX(e.clientX - rect.left - rect.width / 2)
        setTgY(e.clientY - rect.top - rect.height / 2)
      }}
    >
      <div
        ref={interactiveRef}
        className={cn("absolute inset-0 blur-xl", className)}
        style={{
          background: `linear-gradient(to right, ${colors || defaultColors})`,
          animation: `gradient-animation ${duration}s ease infinite`,
          filter: `blur(${blur}px)`,
          width: width,
          height: height,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
