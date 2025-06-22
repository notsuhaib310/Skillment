import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.skillment.in/api"

// Pre-assigned subdomains that should bypass validation
const PRE_ASSIGNED_SUBDOMAINS = [
  'compiler',
  'judge0',
  'exam'
]

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || ""
  const subdomain = hostname.split(".")[0]
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth")
  const token = request.cookies.get("token")?.value

  // Bypass subdomain validation for localhost for local development
  if (hostname === "localhost:3001" || hostname === "localhost") {
    // If on auth page and token exists, redirect to dashboard
    if (isAuthPage && token) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    // If not on auth page and no token, redirect to login
    if (!isAuthPage && !token) {
      const loginUrl = new URL("/auth/login", request.url)
      loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // Skip validation for auth pages and API routes
  if (isAuthPage || request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  // If not on a subdomain, redirect to main site
  if (hostname === "skillment.in" || hostname === "www.skillment.in") {
    return NextResponse.redirect(new URL("https://skillment.in"))
  }

  // Special case for app.skillment.in and pre-assigned subdomains
  if (subdomain === "app" || PRE_ASSIGNED_SUBDOMAINS.includes(subdomain)) {
    return NextResponse.next()
  }

  try {
    // Check if organization exists
    const response = await fetch(`${API_URL}/organizations/validate/${subdomain}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.error(`Organization validation failed: ${response.status} ${response.statusText}`)
      return NextResponse.rewrite(new URL("/error", request.url))
    }

    const data = await response.json()
    console.log('Organization validation response:', data)

    if (!data.exists) {
      console.error(`Organization not found: ${subdomain}`)
      return NextResponse.rewrite(new URL("/error", request.url))
    }

    // If user is logged in, verify they belong to this organization
    if (token) {
      try {
        console.log('Middleware: Verifying user token for subdomain:', subdomain)
        const userResponse = await fetch(`${API_URL}/auth/verify`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })

        console.log('Middleware: Verify response status:', userResponse.status)

        if (userResponse.ok) {
          const userData = await userResponse.json()
          console.log('Middleware: User data:', {
            userEmail: userData.user?.email,
            userOrg: userData.organization?.name,
            currentSubdomain: subdomain,
            match: userData.organization?.name === subdomain
          })
          
          // Check if user's organization matches the subdomain
          if (userData.organization && userData.organization.name.toLowerCase() !== subdomain.toLowerCase()) {
            console.error(`User ${userData.user.email} tried to access organization ${subdomain} but belongs to ${userData.organization.name}`)
            // Clear the invalid token and redirect to login
            const response = NextResponse.redirect(new URL("/auth/login", request.url))
            response.cookies.delete("token")
            return response
          }
        } else {
          console.log('Middleware: Verify failed, clearing token')
          // Invalid token, clear it and redirect to login
          const response = NextResponse.redirect(new URL("/auth/login", request.url))
          response.cookies.delete("token")
          return response
        }
      } catch (error) {
        console.error("Error verifying user token:", error)
        // Clear the invalid token and redirect to login
        const response = NextResponse.redirect(new URL("/auth/login", request.url))
        response.cookies.delete("token")
        return response
      }
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

    console.log('Middleware: All checks passed, allowing access to:', request.nextUrl.pathname)
    return NextResponse.next()
  } catch (error) {
    console.error("Error validating organization:", error)
    // Show error page instead of redirecting
    return NextResponse.rewrite(new URL("/error", request.url))
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
} 