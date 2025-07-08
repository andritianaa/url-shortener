import { NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth()

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const [totalLinks, activeLinks, totalClicks, clicksToday] = await Promise.all([
            prisma.link.count({ where: { userId: user.id } }),
            prisma.link.count({ where: { userId: user.id, isActive: true } }),
            prisma.click.count({
                where: {
                    link: { userId: user.id },
                },
            }),
            prisma.click.count({
                where: {
                    link: { userId: user.id },
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
    } catch (error: any) {
        console.error("Error fetching dashboard stats:", error)
        if (error.message === "Non autorisé") {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
        }
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
    }
}
