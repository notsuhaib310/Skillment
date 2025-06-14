"use client"
import type React from "react"
import { cn } from "@/lib/utils"

export const MovingBorder = ({
  children,
  duration = 2000,
  className,
  containerClassName,
  borderRadius = "1rem",
  colors = ["#0F2027", "#203A43", "#2C5364"],
  as: Component = "div",
}: {
  children?: React.ReactNode
  duration?: number
  className?: string
  containerClassName?: string
  borderRadius?: string
  colors?: string[]
  as?: any
}) => {
  const gradientTransform = `rotate(${Math.floor(Math.random() * 360)}deg)`
  const maskImage = `radial-gradient(circle at center, black 60%, transparent 70%)`

  return (
    <Component className={cn("relative p-[1px] group", containerClassName)}>
      <div
        className="absolute inset-0 rounded-[inherit]"
        style={{
          background: `linear-gradient(to right, ${colors.join(", ")})`,
          backgroundSize: "200% 200%",
          animation: `gradient-animation ${duration}ms linear infinite`,
          borderRadius: borderRadius,
          transform: gradientTransform,
        }}
      />
      <div
        className={cn("relative bg-black rounded-[inherit] z-10", className)}
        style={{
          borderRadius: `calc(${borderRadius} - 1px)`,
        }}
      >
        {children}
      </div>
    </Component>
  )
}
