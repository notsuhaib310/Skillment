import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const hostname = request.headers.get("host") || ""
  const subdomain = hostname.split(".")[0]
  
  // Allow access to public routes
  if (request.nextUrl.pathname.startsWith("/_next") || 
      request.nextUrl.pathname.startsWith("/api") ||
      request.nextUrl.pathname.startsWith("/static")) {
    return NextResponse.next()
  }

  // Check if user is authenticated
  if (!token) {
    const url = new URL("/auth/login", request.url)
    url.searchParams.set("callbackUrl", request.url)
    url.searchParams.set("org", subdomain)
    return NextResponse.redirect(url)
  }

  // Verify organization access
  if (token.orgName !== subdomain) {
    return NextResponse.redirect(new URL("/auth/unauthorized", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
} 