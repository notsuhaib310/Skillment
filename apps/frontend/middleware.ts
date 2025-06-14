import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifySession } from "./lib/auth-server"

// Add paths that require authentication
const protectedPaths = ["/dashboard"]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Check if the path requires authentication
  if (protectedPaths.some((protectedPath) => path.startsWith(protectedPath))) {
    const session = await verifySession()

    if (!session.success) {
      // Redirect to login page with the current path as the return URL
      const returnUrl = encodeURIComponent(path)
      return NextResponse.redirect(new URL(`/login?returnUrl=${returnUrl}`, request.url))
    }
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
