"use client"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { JSX } from "react/jsx-runtime" // Import JSX to fix the undeclared variable error

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string
    link: string
    icon?: JSX.Element
  }[]
  className?: string
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-6 z-[5000] mx-auto flex max-w-fit items-center justify-center space-x-4 rounded-full border border-white/30 bg-black px-8 py-4 shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] backdrop-blur-md transition-all duration-500",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-[-100%] opacity-0",
        className,
      )}
    >
      {navItems.map((navItem, idx) => (
        <a
          key={`link=${idx}`}
          href={navItem.link}
          onMouseEnter={() => setActiveIndex(idx)}
          onMouseLeave={() => setActiveIndex(null)}
          className={cn(
            "relative flex items-center space-x-1 text-neutral-50 hover:text-neutral-300",
            activeIndex === idx ? "text-neutral-100" : "text-neutral-500",
          )}
        >
          <span className="block sm:hidden">{navItem.icon}</span>
          <span className="hidden text-sm sm:block">{navItem.name}</span>
        </a>
      ))}
    </div>
  )
}
