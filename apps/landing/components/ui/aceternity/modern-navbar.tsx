"use client"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import {
  Code,
  ChevronDown,
  Sun,
  Moon,
  BarChart3,
  ArrowRight,
  Brain,
  Camera,
  FileText,
  LogOut,
  User,
} from "lucide-react"
import { getCurrentUser, logoutUser } from "@/app/actions/auth"
import { useRouter } from "next/navigation"
import { OrgLoginModal } from "@/components/auth/org-login-modal"

const productItems = [
  {
    icon: Brain,
    title: "AI Test Generator",
    description: "Generate diverse coding challenges automatically",
    href: "#ai-generator",
  },
  {
    icon: Camera,
    title: "Live Proctoring",
    description: "Real-time monitoring with AI detection",
    href: "#proctoring",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Comprehensive performance insights",
    href: "#analytics",
  },
  {
    icon: FileText,
    title: "Report Builder",
    description: "Detailed assessment reports",
    href: "#reports",
  },
]

export const ModernNavbar = () => {
  const router = useRouter()
  const [isProductsOpen, setIsProductsOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await getCurrentUser()
        if (result.success) {
          setUser(result.user)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      await logoutUser()
      setUser(null)
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center">
      <nav className="bg-black/80 backdrop-blur-md border border-white/10 rounded-full px-6 py-3 w-auto max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Skillment</span>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-8 mx-8">
            {/* Products Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsProductsOpen(true)}
              onMouseLeave={() => setIsProductsOpen(false)}
            >
              <button className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors">
                <span>Products</span>
                <ChevronDown
                  className={cn("w-4 h-4 transition-transform duration-200", isProductsOpen ? "rotate-180" : "")}
                />
              </button>

              <AnimatePresence>
                {isProductsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-80 bg-black/90 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl"
                  >
                    <div className="grid gap-3">
                      {productItems.map((item, index) => (
                        <motion.a
                          key={item.title}
                          href={item.href}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
                        >
                          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <item.icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-white font-medium">{item.title}</h3>
                            <p className="text-gray-400 text-sm">{item.description}</p>
                          </div>
                        </motion.a>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a href="/solutions" className="text-gray-300 hover:text-white transition-colors">
              Solutions
            </a>
            <a href="/pricing" className="text-gray-300 hover:text-white transition-colors">
              Pricing
            </a>
            <a href="/team" className="text-gray-300 hover:text-white transition-colors">
              Team
            </a>
            <a href="/contact" className="text-gray-300 hover:text-white transition-colors">
              Contact
            </a>
            <a href="https://compiler.skillment.com" className="text-gray-300 hover:text-white transition-colors">
              Try Compiler
            </a>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-gray-300" /> : <Moon className="w-4 h-4 text-gray-300" />}
            </button>

            {!isLoading && (
              <>
                {user ? (
                  /* User Menu */
                  <div
                    className="relative"
                    onMouseEnter={() => setIsUserMenuOpen(true)}
                    onMouseLeave={() => setIsUserMenuOpen(false)}
                  >
                    <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="hidden sm:block">{user.firstName}</span>
                      <ChevronDown
                        className={cn("w-4 h-4 transition-transform duration-200", isUserMenuOpen ? "rotate-180" : "")}
                      />
                    </button>

                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full right-0 mt-2 w-48 bg-black/90 backdrop-blur-md border border-white/10 rounded-xl p-2 shadow-2xl"
                        >
                          <a
                            href="/dashboard"
                            className="flex items-center space-x-2 p-3 rounded-lg hover:bg-white/5 transition-colors text-gray-300 hover:text-white"
                          >
                            <BarChart3 className="w-4 h-4" />
                            <span>Dashboard</span>
                          </a>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-2 p-3 rounded-lg hover:bg-white/5 transition-colors text-gray-300 hover:text-white"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  /* Login/Signup Buttons */
                  <>
                    <button 
                      onClick={() => setIsLoginModalOpen(true)}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      Log In
                    </button>

                    <motion.a
                      href="/signup"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 hover:shadow-lg transition-all duration-300 group"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.a>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Organization Login Modal */}
      <OrgLoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  )
}
