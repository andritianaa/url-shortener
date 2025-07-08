import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      // Supprimer le cookie invalide
      const response = NextResponse.json({ error: "Session invalide" }, { status: 401 })
      response.cookies.delete("session")
      return response
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
