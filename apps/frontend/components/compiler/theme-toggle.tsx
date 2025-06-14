"use client"
import { Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  isDarkTheme: boolean
  onThemeChange: (isDark: boolean) => void
}

export const ThemeToggle = ({ isDarkTheme, onThemeChange }: ThemeToggleProps) => {
  return (
    <button
      onClick={() => onThemeChange(!isDarkTheme)}
      className={cn(
        "w-12 h-6 rounded-full transition-colors",
        isDarkTheme ? "bg-gradient-to-r from-orange-500 to-red-500" : "bg-white/10",
      )}
    >
      <div
        className={cn(
          "w-4 h-4 bg-white rounded-full flex items-center justify-center transition-transform",
          isDarkTheme ? "translate-x-7" : "translate-x-1",
        )}
      >
        {isDarkTheme ? <Moon className="w-3 h-3 text-orange-500" /> : <Sun className="w-3 h-3 text-orange-500" />}
      </div>
    </button>
  )
}
