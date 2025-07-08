import { NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    const links = await prisma.link.findMany({
      where: { userId: user.id },
      include: {
        file: true,
        _count: {
          select: { clicks: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const formattedLinks = links.map((link) => ({
      id: link.id,
      shortCode: link.shortCode,
      originalUrl: link.originalUrl,
      customAlias: link.customAlias,
      description: link.description,
      clicks: link._count.clicks,
      isActive: link.isActive,
      hasPassword: !!link.password,
      expirationDate: link.expirationDate?.toISOString(),
      maxClicks: link.maxClicks,
      fileInfo: link.file
        ? {
          filename: link.file.filename,
          originalName: link.file.originalName,
          size: link.file.size,
        }
        : null,
      openGraph: {
        title: link.ogTitle,
        description: link.ogDescription,
        image: link.ogImage,
      },
      createdAt: link.createdAt.toISOString(),
      updatedAt: link.updatedAt.toISOString(),
    }))

    return NextResponse.json(formattedLinks)
  } catch (error: any) {
    console.error("Error fetching links:", error)
    if (error.message === "Non autorisé") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
