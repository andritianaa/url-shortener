import { NextRequest, NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            links: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const totalClicks = await prisma.click.count({
          where: {
            link: {
              userId: user.id,
            },
          },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          linksCount: user._count.links,
          totalClicks,
          createdAt: user.createdAt.toISOString(),
        }
      }),
    )

    return NextResponse.json(usersWithStats)
  } catch (error: any) {
    console.error("Error fetching users:", error)
    if (error.message === "Non autorisé") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }
    if (error.message === "Accès interdit - droits administrateur requis") {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 })
    }
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
