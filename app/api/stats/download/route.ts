import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { filename } = await request.json()

    // Ici on enregistrerait les statistiques de téléchargement
    // Dans une vraie application, on sauvegarderait en base de données
    console.log(`Téléchargement du fichier: ${filename}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
