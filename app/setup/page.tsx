"use client"
import { useState } from "react"
import { ModernNavbar } from "@/components/ui/aceternity/modern-navbar"
import { MinimalistFooter } from "@/components/ui/aceternity/minimalist-footer"
import { Database, CheckCircle, Play } from "lucide-react"
import { AnimatedButton } from "@/components/ui/aceternity/animated-button"

export default function SetupPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const runSetup = async () => {
    setIsRunning(true)
    setResults([])
    setError(null)

    try {
      setResults((prev) => [...prev, "🔄 Starting database setup..."])

      // Test connection
      setResults((prev) => [...prev, "🔄 Testing database connection..."])
      const testResponse = await fetch("/api/setup/test-connection", { method: "POST" })
      const testResult = await testResponse.json()

      if (!testResult.success) {
        throw new Error(`Connection failed: ${testResult.error}`)
      }

      setResults((prev) => [...prev, "✅ Database connection successful"])

      // Run migrations
      setResults((prev) => [...prev, "🔄 Creating database tables..."])
      const migrateResponse = await fetch("/api/setup/migrate", { method: "POST" })
      const migrateResult = await migrateResponse.json()

      if (!migrateResult.success) {
        throw new Error(`Migration failed: ${migrateResult.error}`)
      }

      setResults((prev) => [...prev, "✅ Database tables created successfully"])
      setResults((prev) => [...prev, "🎉 Setup completed! You can now use the authentication system."])
    } catch (err: any) {
      setError(err.message)
      setResults((prev) => [...prev, `❌ Error: ${err.message}`])
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <ModernNavbar />

      <div className="relative pt-32 pb-20">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Database className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Database Setup</h1>
            <p className="text-xl text-gray-300">
              Initialize your Skillment database with the required tables and indexes.
            </p>
          </div>

          <div className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Setup Process</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <span className="text-blue-400 font-bold">1</span>
                  </div>
                  <span className="text-gray-300">Test database connection</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <span className="text-blue-400 font-bold">2</span>
                  </div>
                  <span className="text-gray-300">Create users, sessions, and verification_tokens tables</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <span className="text-blue-400 font-bold">3</span>
                  </div>
                  <span className="text-gray-300">Create database indexes for performance</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <span className="text-blue-400 font-bold">4</span>
                  </div>
                  <span className="text-gray-300">Create test user account (optional)</span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <AnimatedButton
                onClick={runSetup}
                disabled={isRunning}
                colors={["#ea580c", "#dc2626", "#be185d"]}
                className="w-full py-4 text-lg group"
              >
                {isRunning ? "Running Setup..." : "Run Database Setup"}
                {!isRunning && <Play className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </AnimatedButton>
            </div>

            {/* Results */}
            {results.length > 0 && (
              <div className="bg-black/50 border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Setup Log</h3>
                <div className="space-y-2 font-mono text-sm">
                  {results.map((result, index) => (
                    <div key={index} className="text-gray-300">
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Environment Variables Info */}
            <div className="mt-8 bg-orange-500/10 border border-orange-500/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Required Environment Variables</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">
                    <code className="bg-black/50 px-2 py-1 rounded">DATABASE_URL</code> - Your Neon PostgreSQL
                    connection string
                  </span>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-4">
                Make sure your DATABASE_URL environment variable is set before running the setup.
              </p>
            </div>
          </div>
        </div>
      </div>

      <MinimalistFooter />
    </div>
  )
}
