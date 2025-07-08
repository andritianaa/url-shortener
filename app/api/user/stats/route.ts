import { NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth()

        // Récupérer l'utilisateur avec sa date de création
        const userWithDate = await prisma.user.findUnique({
            where: { id: user.id },
            select: { createdAt: true },
        })

        if (!userWithDate) {
            return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
        }

        // Calculer les statistiques
        const [totalLinks, activeLinks, totalClicks] = await Promise.all([
            prisma.link.count({ where: { userId: user.id } }),
            prisma.link.count({ where: { userId: user.id, isActive: true } }),
            prisma.click.count({
                where: {
                    link: { userId: user.id },
                },
            }),
        ])

        return NextResponse.json({
            totalLinks,
            activeLinks,
            totalClicks,
            joinDate: userWithDate.createdAt.toISOString(),
        })
    } catch (error: any) {
        console.error("Error fetching user stats:", error)
        if (error.message === "Non autorisé") {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
        }
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
    }
}
