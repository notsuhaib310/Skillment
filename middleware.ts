import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define which routes require authentication
const protectedRoutes = ["/dashboard", "/settings", "/exams"]
const authRoutes = ["/login", "/signup"]

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value
  const path = request.nextUrl.pathname

  // Check if the route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route))

  // If no token and trying to access protected route, redirect to login
  if (isProtectedRoute && !token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("redirect", path)
    return NextResponse.redirect(url)
  }

  // If token exists and trying to access auth routes, we'll let the server action handle verification
  // This avoids importing server-only modules in middleware

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
