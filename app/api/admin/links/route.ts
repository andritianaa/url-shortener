import { NextRequest, NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // Vérifier que l'utilisateur est admin
        const user = await requireAdmin()
        if (!user) {
            return NextResponse.json({ error: "Accès interdit" }, { status: 403 })
        }

        const links = await prisma.link.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: { clicks: true },
                },
            },
            orderBy: { createdAt: "desc" },
            take: 100, // Limiter pour les performances
        })

        const formattedLinks = links.map((link) => ({
            id: link.id,
            shortCode: link.shortCode,
            originalUrl: link.originalUrl,
            description: link.description,
            userName: link.user?.name || link.user?.email || "Utilisateur supprimé",
            isActive: link.isActive,
            clicks: link._count.clicks,
            createdAt: link.createdAt.toISOString(),
        }))

        return NextResponse.json(formattedLinks)
    } catch (error) {
        console.error("Error fetching admin links:", error)
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
    }
}
