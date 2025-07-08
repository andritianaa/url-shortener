import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
    try {
        const user = await requireAuth()
        const { currentPassword, newPassword } = await request.json()

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: "Mot de passe actuel et nouveau mot de passe requis" }, { status: 400 })
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: "Le nouveau mot de passe doit contenir au moins 6 caractères" },
                { status: 400 },
            )
        }

        // Récupérer l'utilisateur avec son mot de passe
        const userWithPassword = await prisma.user.findUnique({
            where: { id: user.id },
        })

        if (!userWithPassword) {
            return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
        }

        // Vérifier le mot de passe actuel
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userWithPassword.password)
        if (!isCurrentPasswordValid) {
            return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 400 })
        }

        // Hasher le nouveau mot de passe
        const hashedNewPassword = await bcrypt.hash(newPassword, 12)

        // Mettre à jour le mot de passe
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedNewPassword },
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("Error updating password:", error)
        if (error.message === "Non autorisé") {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
        }
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
    }
}
