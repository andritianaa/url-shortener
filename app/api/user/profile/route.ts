import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id")

        if (!userId) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
        }

        const { name, email } = await request.json()

        if (!email) {
            return NextResponse.json({ error: "L'email est requis" }, { status: 400 })
        }

        // Vérifier si l'email est déjà utilisé par un autre utilisateur
        const existingUser = await prisma.user.findFirst({
            where: {
                email,
                id: { not: userId },
            },
        })

        if (existingUser) {
            return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 })
        }

        // Mettre à jour l'utilisateur
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { name, email },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error("Error updating profile:", error)
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
    }
}
