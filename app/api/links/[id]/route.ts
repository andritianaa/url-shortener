import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = request.headers.get("x-user-id")
    const userRole = request.headers.get("x-user-role")

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Trouver le lien avec ses informations de fichier
    const link = await prisma.link.findUnique({
      where: { id: params.id },
      include: { file: true },
    })

    if (!link) {
      return NextResponse.json({ error: "Lien non trouvé" }, { status: 404 })
    }

    // Vérifier les permissions (propriétaire ou admin)
    if (link.userId !== userId && userRole !== "ADMIN") {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 })
    }

    // Supprimer le fichier associé si présent
    if (link.file) {
      try {
        await fetch(`${process.env.FILE_SERVER_URL}/delete`, {
          method: "DELETE",
          headers: {
            "X-API-Key": process.env.FILE_SERVER_API_KEY || "votre-api-key-secret",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: link.file.url,
          }),
        })
      } catch (error) {
        console.error("Erreur lors de la suppression du fichier:", error)
      }
    }

    // Supprimer le lien (cascade supprimera automatiquement les clics et le fichier)
    await prisma.link.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting link:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = request.headers.get("x-user-id")
    const userRole = request.headers.get("x-user-role")

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const link = await prisma.link.findUnique({
      where: { id: params.id },
      include: {
        file: true,
        clicks: {
          orderBy: { createdAt: "desc" },
          take: 100, // Limiter aux 100 derniers clics
        },
        _count: {
          select: { clicks: true },
        },
      },
    })

    if (!link) {
      return NextResponse.json({ error: "Lien non trouvé" }, { status: 404 })
    }

    // Vérifier les permissions
    if (link.userId !== userId && userRole !== "ADMIN") {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 })
    }

    return NextResponse.json({
      id: link.id,
      shortCode: link.shortCode,
      originalUrl: link.originalUrl,
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
      clicksData: link.clicks.map((click) => ({
        id: click.id,
        country: click.country,
        city: click.city,
        device: click.device,
        browser: click.browser,
        os: click.os,
        referer: click.referer,
        createdAt: click.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error("Error fetching link:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
