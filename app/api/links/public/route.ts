import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Récupérer tous les liens publics (actifs et visibles)
        const links = await prisma.link.findMany({
            where: {
                isActive: true, // Seulement les liens actifs
                // On peut ajouter d'autres critères comme isPublic si on l'ajoute au schéma
            },
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
            orderBy: [
                { createdAt: "desc" }, // Les plus récents en premier
            ],
            take: 100, // Limiter pour les performances
        })

        const formattedLinks = links.map((link) => ({
            id: link.id,
            shortCode: link.shortCode,
            originalUrl: link.originalUrl,
            description: link.description,
            userName: link.user?.name || link.user?.email || "Utilisateur anonyme",
            clicks: link._count.clicks,
            createdAt: link.createdAt.toISOString(),
            isActive: link.isActive,
        }))

        return NextResponse.json(formattedLinks)
    } catch (error) {
        console.error("Error fetching public links:", error)
        return NextResponse.json({ error: "Erreur lors de la récupération des liens publics" }, { status: 500 })
    }
}
