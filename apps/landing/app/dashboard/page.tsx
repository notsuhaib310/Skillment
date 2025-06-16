import { ModernNavbar } from "@/components/ui/aceternity/modern-navbar"
import { MinimalistFooter } from "@/components/ui/aceternity/minimalist-footer"
import { getCurrentUser } from "@/app/actions/auth"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const { success, user } = await getCurrentUser()

  if (!success) {
    redirect("/login")
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

        <div className="relative z-10 max-w-8xl mx-auto px-6 lg:px-12 xl:px-16">
          <div className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <h1 className="text-3xl font-bold mb-6">Welcome, {user?.firstName}!</h1>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Active Exams</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Completed Exams</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Students</span>
                    <span className="font-medium">0</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <p className="text-gray-400">No recent activity to display.</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Account Status</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Plan</span>
                    <span className="font-medium">Free Trial</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Days Remaining</span>
                    <span className="font-medium">14</span>
                  </div>
                  <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg font-medium mt-2">
                    Upgrade Plan
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-black/30 rounded-lg p-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-3">
                    <span className="font-bold">1</span>
                  </div>
                  <h3 className="font-medium mb-2">Create an Exam</h3>
                  <p className="text-sm text-gray-400">Set up your first coding assessment with custom questions.</p>
                </div>

                <div className="bg-black/30 rounded-lg p-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-3">
                    <span className="font-bold">2</span>
                  </div>
                  <h3 className="font-medium mb-2">Invite Students</h3>
                  <p className="text-sm text-gray-400">Send invitations to participants via email or link.</p>
                </div>

                <div className="bg-black/30 rounded-lg p-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-3">
                    <span className="font-bold">3</span>
                  </div>
                  <h3 className="font-medium mb-2">Review Results</h3>
                  <p className="text-sm text-gray-400">Analyze performance and get AI-powered insights.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MinimalistFooter />
    </div>
  )
}
