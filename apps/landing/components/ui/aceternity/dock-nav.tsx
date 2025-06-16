"use client"
import { cn } from "@/lib/utils"
import { useState } from "react"
import type { JSX } from "react/jsx-runtime"

export const DockNav = ({
  items,
  className,
}: {
  items: {
    title: string
    icon: JSX.Element
    href: string
  }[]
  className?: string
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  return (
    <div
      className={cn(
        "mx-auto flex h-16 w-max items-end gap-4 rounded-2xl border border-white/20 bg-black/40 px-4 pb-3 backdrop-blur-md",
        className,
      )}
    >
      {items.map((item, idx) => (
        <a
          key={item.title}
          href={item.href}
          className={cn(
            "flex aspect-square cursor-pointer items-center justify-center rounded-full transition-all duration-300",
            hoveredIndex === idx
              ? "h-12 w-12 bg-white/20"
              : hoveredIndex !== null
                ? "h-8 w-8 bg-white/5"
                : "h-10 w-10 bg-white/10",
          )}
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div
            className={cn(
              "transition-all duration-300",
              hoveredIndex === idx ? "scale-110" : hoveredIndex !== null ? "scale-90" : "scale-100",
            )}
          >
            {item.icon}
          </div>
        </a>
      ))}
    </div>
  )
}
