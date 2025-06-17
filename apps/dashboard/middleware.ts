import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.skillment.in/api"

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || ""
  const subdomain = hostname.split(".")[0]
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth")
  const token = request.cookies.get("token")?.value

  // Skip validation for auth pages and API routes
  if (isAuthPage || request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  // If not on a subdomain, redirect to main site
  if (hostname === "skillment.in" || hostname === "www.skillment.in") {
    return NextResponse.redirect(new URL("https://skillment.in"))
  }

  try {
    // Check if organization exists
    const response = await fetch(`${API_URL}/organizations/validate/${subdomain}`)
    const data = await response.json()

    if (!response.ok || !data.exists) {
      // Organization doesn't exist, redirect to main site with error
      const mainSiteUrl = new URL("https://skillment.in")
      mainSiteUrl.searchParams.set("error", "Organization not found")
      return NextResponse.redirect(mainSiteUrl)
    }

    // If trying to access auth pages while logged in, redirect to dashboard
    if (isAuthPage && token) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // If trying to access protected pages while not logged in, redirect to login
    if (!isAuthPage && !token) {
      const loginUrl = new URL("/auth/login", request.url)
      loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Error validating organization:", error)
    // On error, redirect to main site
    return NextResponse.redirect(new URL("https://skillment.in"))
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
} 