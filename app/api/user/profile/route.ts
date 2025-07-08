import { NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
    try {
        const user = await requireAuth()
        const { name, email } = await request.json()

        if (!email) {
            return NextResponse.json({ error: "L'email est requis" }, { status: 400 })
        }

        // Vérifier si l'email est déjà utilisé par un autre utilisateur
        const existingUser = await prisma.user.findFirst({
            where: {
                email,
                id: { not: user.id },
            },
        })

        if (existingUser) {
            return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 })
        }

        // Mettre à jour l'utilisateur
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { name, email },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        })

        return NextResponse.json(updatedUser)
    } catch (error: any) {
        console.error("Error updating profile:", error)
        if (error.message === "Non autorisé") {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
        }
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
    }
}
