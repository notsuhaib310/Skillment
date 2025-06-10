"use client"
import type React from "react"
import { cn } from "@/lib/utils"

export const AnimatedButton = ({
  children,
  className,
  containerClassName,
  borderClassName,
  duration = 2000,
  borderRadius = "1rem",
  colors = ["#0F2027", "#203A43", "#2C5364"],
  ...props
}: {
  children?: React.ReactNode
  className?: string
  containerClassName?: string
  borderClassName?: string
  duration?: number
  borderRadius?: string
  colors?: string[]
  [key: string]: any
}) => {
  return (
    <div
      className={cn("relative p-[1px] overflow-hidden rounded-lg group", containerClassName)}
      style={{
        borderRadius: borderRadius,
      }}
    >
      <div
        className={cn("absolute inset-0 z-0", borderClassName)}
        style={{
          background: `linear-gradient(to right, ${colors.join(", ")})`,
          borderRadius: borderRadius,
          animation: `gradient-animation ${duration}ms linear infinite`,
          backgroundSize: "200% 200%",
        }}
      />
      <button
        className={cn(
          "relative z-10 w-full h-full flex items-center justify-center px-6 py-3 bg-black rounded-lg text-white font-medium transition-all duration-200",
          className,
        )}
        style={{
          borderRadius: `calc(${borderRadius} - 1px)`,
        }}
        {...props}
      >
        {children}
      </button>
    </div>
  )
}
