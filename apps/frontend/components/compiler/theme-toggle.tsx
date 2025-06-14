"use client"
import { Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  isDark: boolean
  setIsDark: (isDark: boolean) => void
}

export const ThemeToggle = ({ isDark, setIsDark }: ThemeToggleProps) => {
  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className={cn(
        "w-12 h-6 rounded-full transition-colors",
        isDark ? "bg-gradient-to-r from-orange-500 to-red-500" : "bg-white/10",
      )}
    >
      <div
        className={cn(
          "w-4 h-4 bg-white rounded-full flex items-center justify-center transition-transform",
          isDark ? "translate-x-7" : "translate-x-1",
        )}
      >
        {isDark ? <Moon className="w-3 h-3 text-orange-500" /> : <Sun className="w-3 h-3 text-orange-500" />}
      </div>
    </button>
  )
}
