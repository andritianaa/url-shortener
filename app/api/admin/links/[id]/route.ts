import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const userRole = request.headers.get("x-user-role")

        if (userRole !== "ADMIN") {
            return NextResponse.json({ error: "Accès interdit" }, { status: 403 })
        }

        // Trouver le lien avec ses informations de fichier
        const link = await prisma.link.findUnique({
            where: { id: params.id },
            include: { file: true },
        })

        if (!link) {
            return NextResponse.json({ error: "Lien non trouvé" }, { status: 404 })
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
        console.error("Error deleting admin link:", error)
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
    }
}
