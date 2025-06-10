import { ModernNavbar } from "@/components/ui/aceternity/modern-navbar"
import { MinimalistFooter } from "@/components/ui/aceternity/minimalist-footer"
import { CheckCircle, Mail, ArrowRight } from "lucide-react"
import { AnimatedButton } from "@/components/ui/aceternity/animated-button"
import Link from "next/link"

export default function SignupSuccessPage() {
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
          <div className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-2xl p-8 w-full max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">Account Created Successfully!</h2>

            <p className="text-gray-300 mb-6">
              We've sent a verification email to your inbox. Please check your email and verify your account to get
              started.
            </p>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-orange-400 mr-2" />
                <span className="text-white font-medium">Check your inbox</span>
              </div>
              <p className="text-sm text-gray-400">
                If you don't see the email in your inbox, please check your spam folder or request a new verification
                email.
              </p>
            </div>

            <div className="space-y-4">
              <Link href="/login" passHref>
                <AnimatedButton colors={["#ea580c", "#dc2626", "#be185d"]} className="w-full py-3 group">
                  Continue to Login
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </AnimatedButton>
              </Link>

              <button className="w-full px-6 py-3 border border-white/10 rounded-lg text-white hover:bg-white/5 transition-colors">
                Resend Verification Email
              </button>
            </div>
          </div>
        </div>
      </div>

      <MinimalistFooter />
    </div>
  )
}
