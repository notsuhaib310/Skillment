import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Only protect dashboard routes
  if (path.startsWith("/dashboard")) {
    // Since we can't access localStorage in middleware, we'll let the client handle the redirect
    return NextResponse.next()
  }

  return NextResponse.next()
}

// Only run middleware on dashboard routes
export const config = {
  matcher: ["/dashboard/:path*"]
} 