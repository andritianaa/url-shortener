import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id")

        if (!userId) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const [totalLinks, activeLinks, totalClicks, clicksToday] = await Promise.all([
            prisma.link.count({ where: { userId } }),
            prisma.link.count({ where: { userId, isActive: true } }),
            prisma.click.count({
                where: {
                    link: { userId },
                },
            }),
            prisma.click.count({
                where: {
                    link: { userId },
                    createdAt: { gte: today },
                },
            }),
        ])

        return NextResponse.json({
            totalLinks,
            activeLinks,
            totalClicks,
            clicksToday,
        })
    } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
    }
}
