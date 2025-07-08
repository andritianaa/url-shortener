import { NextResponse } from 'next/server';

import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Routes qui nécessitent une authentification
  const protectedRoutes = ["/dashboard", "/admin"]
  const adminRoutes = ["/admin"]

  // Vérifier si la route nécessite une authentification
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    const token = request.cookies.get("session")?.value

    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", request.url))
    }

    // Pour les routes admin, on vérifiera les permissions dans la page elle-même
    // Le middleware ne fait que vérifier la présence du token
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}
