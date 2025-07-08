import { cookies } from 'next/headers';

import { getSessionUser } from '@/lib/auth';

export async function getCurrentUser() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("session")?.value

        if (!token) {
            return null
        }

        const user = await getSessionUser(token)
        return user
    } catch (error) {
        console.error("Error getting current user:", error)
        return null
    }
}

export async function requireAuth() {
    const user = await getCurrentUser()
    if (!user) {
        throw new Error("Non autorisé")
    }
    return user
}

export async function requireAdmin() {
    const user = await requireAuth()
    if (user.role !== "ADMIN") {
        throw new Error("Accès interdit - droits administrateur requis")
    }
    return user
}
