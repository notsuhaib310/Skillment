import { SignupForm } from "@/components/auth/signup-form"
import { ModernNavbar } from "@/components/ui/aceternity/modern-navbar"
import { MinimalistFooter } from "@/components/ui/aceternity/minimalist-footer"

export default function SignupPage() {
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
          <SignupForm />
        </div>
      </div>

      <MinimalistFooter />
    </div>
  )
}
