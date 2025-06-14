import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value

  // If no token, redirect to frontend login
  if (!token) {
    return NextResponse.redirect(new URL("http://localhost:3000/login"))
  }

  try {
    // Verify token with backend
    const response = await fetch(`${API_URL}/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    })

    if (!response.ok) {
      // If token is invalid, redirect to frontend login
      return NextResponse.redirect(new URL("http://localhost:3000/login"))
    }
  } catch (error) {
    console.error("Auth verification error:", error)
    return NextResponse.redirect(new URL("http://localhost:3000/login"))
  }

  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
} 