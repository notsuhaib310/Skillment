import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000"

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === "/" || path === "/login" || path === "/signup"

  // Get the auth token from cookies
  const token = request.cookies.get("auth_token")?.value

  // If the path is public and user is authenticated, redirect to dashboard
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // If the path is not public and user is not authenticated, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL(`${FRONTEND_URL}/login`))
  }

  // If the path is not public and user is authenticated, verify the session
  if (!isPublicPath && token) {
    try {
      const response = await fetch(`${API_URL}/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })

      if (!response.ok) {
        // If session is invalid, redirect to login
        return NextResponse.redirect(new URL(`${FRONTEND_URL}/login`))
      }

      // Clone the response and set the auth token cookie
      const responseHeaders = new Headers(response.headers)
      responseHeaders.set("Set-Cookie", `auth_token=${token}; Path=/; Domain=.localhost; SameSite=Lax`)

      return NextResponse.next({
        request: {
          headers: responseHeaders,
        },
      })
    } catch (error) {
      console.error("Session verification error:", error)
      return NextResponse.redirect(new URL(`${FRONTEND_URL}/login`))
    }
  }

  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ["/", "/dashboard/:path*", "/login", "/signup"],
} 