import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id")

        if (!userId) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
        }

        // Récupérer l'utilisateur avec sa date de création
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { createdAt: true },
        })

        if (!user) {
            return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
        }

        // Calculer les statistiques
        const [totalLinks, activeLinks, totalClicks] = await Promise.all([
            prisma.link.count({ where: { userId } }),
            prisma.link.count({ where: { userId, isActive: true } }),
            prisma.click.count({
                where: {
                    link: { userId },
                },
            }),
        ])

        return NextResponse.json({
            totalLinks,
            activeLinks,
            totalClicks,
            joinDate: user.createdAt.toISOString(),
        })
    } catch (error) {
        console.error("Error fetching user stats:", error)
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
    }
}
