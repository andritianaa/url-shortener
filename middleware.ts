import { NextResponse } from 'next/server';

import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Routes qui nécessitent une authentification
  const protectedRoutes = ["/dashboard", "/admin", "/api/links", "/api/shorten"]
  const adminRoutes = ["/admin", "/api/admin"]

  // Vérifier si la route nécessite une authentification
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    const token = request.cookies.get("session")?.value

    if (!token) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
      }
      return NextResponse.redirect(new URL("/auth/signin", request.url))
    }

    // Vérifier la session via une API route
    try {
      const verifyResponse = await fetch(new URL("/api/auth/verify", request.url), {
        headers: {
          Cookie: `session=${token}`,
        },
      })

      if (!verifyResponse.ok) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ error: "Session invalide" }, { status: 401 })
        }
        return NextResponse.redirect(new URL("/auth/signin", request.url))
      }

      const user = await verifyResponse.json()

      // Vérifier les permissions admin
      if (isAdminRoute && user.role !== "ADMIN") {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ error: "Accès interdit" }, { status: 403 })
        }
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }

      // Ajouter l'utilisateur aux headers pour les API routes
      if (pathname.startsWith("/api/")) {
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set("x-user-id", user.id)
        requestHeaders.set("x-user-role", user.role)

        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        })
      }
    } catch (error) {
      console.error("Middleware auth error:", error)
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Erreur d'authentification" }, { status: 500 })
      }
      return NextResponse.redirect(new URL("/auth/signin", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/api/links/:path*", "/api/shorten", "/api/admin/:path*"],
}
