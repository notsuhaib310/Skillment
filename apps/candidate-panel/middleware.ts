import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Security headers for exam integrity
  const response = NextResponse.next()

  // Prevent caching of sensitive pages
  if (pathname.startsWith("/exam") || pathname.startsWith("/summary")) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
    response.headers.set("Surrogate-Control", "no-store")
  }

  // Security headers
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "no-referrer")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

  // Prevent access to exam routes without proper flow
  if (pathname === "/exam" || pathname === "/summary" || pathname === "/thank-you") {
    // In a real application, you would check server-side session/token
    // For now, we rely on client-side checks in the components
  }

  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
