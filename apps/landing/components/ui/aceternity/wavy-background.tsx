"use client"
import type React from "react"
import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  ...props
}: {
  children?: React.ReactNode
  className?: string
  containerClassName?: string
  colors?: string[]
  waveWidth?: number
  backgroundFill?: string
  blur?: number
  speed?: "slow" | "fast"
  waveOpacity?: number
  [key: string]: any
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const container = containerRef.current
    if (!container) return

    const computedStyle = getComputedStyle(container)
    const width = Number.parseFloat(computedStyle.width)
    const height = Number.parseFloat(computedStyle.height)

    canvas.width = width
    canvas.height = height

    const waves = [
      {
        frequency: 0.005,
        amplitude: 20,
        speed: speed === "fast" ? 0.1 : 0.025,
        color: colors?.[0] || "#38bdf8",
      },
      {
        frequency: 0.01,
        amplitude: 15,
        speed: speed === "fast" ? 0.08 : 0.02,
        color: colors?.[1] || "#818cf8",
      },
      {
        frequency: 0.015,
        amplitude: 10,
        speed: speed === "fast" ? 0.06 : 0.015,
        color: colors?.[2] || "#c084fc",
      },
    ]

    let animationFrameId: number
    let time = 0

    const animate = () => {
      ctx.clearRect(0, 0, width, height)

      if (backgroundFill) {
        ctx.fillStyle = backgroundFill
        ctx.fillRect(0, 0, width, height)
      }

      waves.forEach((wave) => {
        drawWave(ctx, width, height, wave.frequency, wave.amplitude, time * wave.speed, wave.color)
      })

      time++
      animationFrameId = requestAnimationFrame(animate)
    }

    const drawWave = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      frequency: number,
      amplitude: number,
      shift: number,
      color: string,
    ) => {
      ctx.beginPath()
      ctx.moveTo(0, height / 2)

      const waveSegments = Math.floor(width / (waveWidth || 10))

      for (let i = 0; i <= waveSegments; i++) {
        const x = i * (waveWidth || 10)
        const y = height / 2 + Math.sin(x * frequency + shift) * amplitude
        ctx.lineTo(x, y)
      }

      ctx.lineTo(width, height)
      ctx.lineTo(0, height)
      ctx.closePath()

      ctx.fillStyle = color
      ctx.globalAlpha = waveOpacity
      ctx.fill()
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [backgroundFill, blur, colors, speed, waveOpacity, waveWidth])

  return (
    <div ref={containerRef} className={cn("relative w-full overflow-hidden", containerClassName)} {...props}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
        style={{
          filter: `blur(${blur}px)`,
        }}
      />
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  )
}
