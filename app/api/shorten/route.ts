import { nanoid } from 'nanoid';
import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

const FILE_SERVER_URL = process.env.FILE_SERVER_URL || "http://localhost:3000"
const API_KEY = process.env.FILE_SERVER_API_KEY || "votre-api-key-secret"

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    const formData = await request.formData()

    const url = formData.get("url") as string
    const customAlias = formData.get("customAlias") as string
    const password = formData.get("password") as string
    const description = formData.get("description") as string
    const expirationDate = formData.get("expirationDate") as string
    const maxClicks = formData.get("maxClicks") as string
    const file = formData.get("file") as File

    // Open Graph fields
    const ogTitle = formData.get("ogTitle") as string
    const ogDescription = formData.get("ogDescription") as string
    const ogImageFile = formData.get("ogImageFile") as File

    let fileInfo = null
    let finalUrl = url
    let ogImageUrl = null

    // Upload du fichier si présent
    if (file) {
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)

      const uploadResponse = await fetch(`${FILE_SERVER_URL}/upload`, {
        method: "POST",
        headers: {
          "X-API-Key": API_KEY,
        },
        body: uploadFormData,
      })

      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json()
        fileInfo = {
          filename: uploadResult.data.filename,
          originalName: uploadResult.data.originalName,
          size: uploadResult.data.size,
          url: uploadResult.data.url,
          mimetype: uploadResult.data.mimetype,
        }
        finalUrl = `/download/${uploadResult.data.filename}`
      } else {
        throw new Error("Échec de l'upload du fichier")
      }
    }

    // Upload de l'image Open Graph si présente
    if (ogImageFile) {
      const ogImageFormData = new FormData()
      ogImageFormData.append("file", ogImageFile)

      const ogImageResponse = await fetch(`${FILE_SERVER_URL}/upload`, {
        method: "POST",
        headers: {
          "X-API-Key": API_KEY,
        },
        body: ogImageFormData,
      })

      if (ogImageResponse.ok) {
        const ogImageResult = await ogImageResponse.json()
        ogImageUrl = ogImageResult.data.url
      }
    }

    // Générer le code court
    const shortCode = customAlias || nanoid(8)

    // Vérifier si l'alias existe déjà
    const existingLink = await prisma.link.findUnique({
      where: { shortCode },
    })

    if (existingLink) {
      return NextResponse.json({ error: "Cet alias est déjà utilisé" }, { status: 400 })
    }

    // Créer le lien en base de données
    const newLink = await prisma.link.create({
      data: {
        shortCode,
        originalUrl: finalUrl,
        customAlias,
        description,
        password,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        maxClicks: maxClicks ? Number.parseInt(maxClicks) : null,
        ogTitle,
        ogDescription,
        ogImage: ogImageUrl,
        userId: userId || null,
        ...(fileInfo && {
          file: {
            create: {
              filename: fileInfo.filename,
              originalName: fileInfo.originalName,
              size: fileInfo.size,
              mimetype: fileInfo.mimetype,
              url: fileInfo.url,
            },
          },
        }),
      },
      include: {
        file: true,
      },
    })

    const baseUrl = request.nextUrl.origin
    const shortUrl = `${baseUrl}/${shortCode}`

    return NextResponse.json({
      shortUrl,
      originalUrl: url || `Fichier: ${fileInfo?.originalName}`,
      shortCode,
      clicks: 0,
      createdAt: newLink.createdAt.toISOString(),
    })
  } catch (error) {
    console.error("Erreur lors de la création du lien:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
