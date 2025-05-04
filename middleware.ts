import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie"

// Define which paths require authentication
const protectedPaths = [
  "/dashboard",
  "/add-expense",
  "/add-income",
  "/upload-statement",
  "/transactions",
  "/budget-insights",
  "/reports",
  "/profile",
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))

  if (isProtectedPath) {
    // Check for the auth cookie
    const authCookie = request.cookies.get(AUTH_COOKIE_NAME)

    // If no auth cookie is present, redirect to login
    if (!authCookie) {
      const url = new URL("/login", request.url)
      url.searchParams.set("callbackUrl", encodeURI(pathname))
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/add-expense/:path*",
    "/add-income/:path*",
    "/upload-statement/:path*",
    "/transactions/:path*",
    "/budget-insights/:path*",
    "/reports/:path*",
    "/profile/:path*",
  ],
}
