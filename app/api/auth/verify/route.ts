import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { getSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("session")?.value

        if (!token) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
        }

        const user = await getSessionUser(token)
        if (!user) {
            return NextResponse.json({ error: "Session invalide" }, { status: 401 })
        }

        return NextResponse.json(user)
    } catch (error) {
        console.error("Auth verify error:", error)
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
    }
}
