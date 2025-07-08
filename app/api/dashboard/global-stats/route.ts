import { NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth()

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        // Statistiques de base
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

        // Clics par date (30 derniers jours)
        const clicksByDateRaw = await prisma.click.findMany({
            where: {
                link: { userId: user.id },
                createdAt: { gte: thirtyDaysAgo },
            },
            select: {
                createdAt: true,
            },
        })

        // Grouper par date
        const clicksByDateMap: { [key: string]: number } = {}
        for (let i = 29; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split("T")[0]
            clicksByDateMap[dateStr] = 0
        }

        clicksByDateRaw.forEach((click) => {
            const dateStr = click.createdAt.toISOString().split("T")[0]
            if (clicksByDateMap.hasOwnProperty(dateStr)) {
                clicksByDateMap[dateStr]++
            }
        })

        const clicksByDate = Object.entries(clicksByDateMap).map(([date, clicks]) => ({
            date,
            clicks,
        }))

        // Top liens
        const topLinksRaw = await prisma.link.findMany({
            where: { userId: user.id },
            include: {
                _count: {
                    select: { clicks: true },
                },
            },
            orderBy: {
                clicks: {
                    _count: "desc",
                },
            },
            take: 10,
        })

        const topLinks = topLinksRaw.map((link) => ({
            shortCode: link.shortCode,
            description: link.description,
            clicks: link._count.clicks,
        }))

        // Statistiques par appareil
        const deviceStatsRaw = await prisma.click.findMany({
            where: {
                link: { userId: user.id },
            },
            select: {
                device: true,
            },
        })

        const deviceCount: { [key: string]: number } = {}
        deviceStatsRaw.forEach((click) => {
            const device = click.device || "Inconnu"
            deviceCount[device] = (deviceCount[device] || 0) + 1
        })

        const deviceStats = Object.entries(deviceCount)
            .map(([device, clicks]) => ({
                device,
                clicks,
                percentage: Math.round((clicks / totalClicks) * 100 * 10) / 10,
            }))
            .sort((a, b) => b.clicks - a.clicks)

        // Statistiques par pays
        const countryStatsRaw = await prisma.click.findMany({
            where: {
                link: { userId: user.id },
            },
            select: {
                country: true,
            },
        })

        const countryCount: { [key: string]: number } = {}
        countryStatsRaw.forEach((click) => {
            const country = click.country || "Inconnu"
            countryCount[country] = (countryCount[country] || 0) + 1
        })

        const countryStats = Object.entries(countryCount)
            .map(([country, clicks]) => ({
                country,
                clicks,
                percentage: Math.round((clicks / totalClicks) * 100 * 10) / 10,
            }))
            .sort((a, b) => b.clicks - a.clicks)
            .slice(0, 10)

        return NextResponse.json({
            totalLinks,
            activeLinks,
            totalClicks,
            clicksToday,
            clicksByDate,
            topLinks,
            deviceStats,
            countryStats,
        })
    } catch (error: any) {
        console.error("Error fetching global stats:", error)
        if (error.message === "Non autorisé") {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
        }
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
    }
}
