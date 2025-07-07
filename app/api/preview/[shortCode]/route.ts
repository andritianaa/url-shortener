import { type NextRequest, NextResponse } from "next/server"

// Simuler une base de données en mémoire pour la démo
const links: any[] = []

export async function GET(request: NextRequest, { params }: { params: { shortCode: string } }) {
  try {
    const { shortCode } = params
    const link = links.find((l) => l.shortCode === shortCode)

    if (!link) {
      return NextResponse.json({ error: "Lien non trouvé" }, { status: 404 })
    }

    // Retourner les données Open Graph
    return NextResponse.json({
      title: link.openGraph?.title || link.description || "Lien raccourci",
      description: link.openGraph?.description || "Redirection vers le lien original",
      image: link.openGraph?.image,
      url: `${request.nextUrl.origin}/${shortCode}`,
      originalUrl: link.originalUrl,
      clicks: link.clicks,
      createdAt: link.createdAt,
    })
  } catch (error) {
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
