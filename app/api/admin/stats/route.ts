import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role")

    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 })
    }

    const [totalUsers, activeUsers, totalLinks, totalClicks, linksToday, clicksToday] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.link.count(),
      prisma.click.count(),
      prisma.link.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.click.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ])

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalLinks,
      totalClicks,
      linksToday,
      clicksToday,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
