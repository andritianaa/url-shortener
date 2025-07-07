import { redirect, notFound } from "next/navigation"
import { RedirectPage } from "@/components/redirect-page"
import { OpenGraphPreview } from "@/components/open-graph-preview"
import { prisma } from "@/lib/prisma"
import { getLocationFromIP } from "@/lib/utils/ip"
import { parseUserAgent } from "@/lib/utils/user-agent"
import type { Metadata } from "next"
import { headers } from "next/headers"

interface PageProps {
  params: {
    shortCode: string
  }
  searchParams: {
    password?: string
    preview?: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { shortCode } = params

  const link = await prisma.link.findUnique({
    where: { shortCode },
  })

  if (!link) {
    return {
      title: "Lien raccourci",
      description: "Redirection vers le lien original",
    }
  }

  const title = link.ogTitle || link.description || "Lien raccourci"
  const description = link.ogDescription || "Redirection vers le lien original"

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: link.ogImage ? [{ url: link.ogImage }] : [],
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/${shortCode}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: link.ogImage ? [link.ogImage] : [],
    },
  }
}

export default async function ShortLinkPage({ params, searchParams }: PageProps) {
  const { shortCode } = params
  const { password, preview } = searchParams

  // Trouver le lien
  const link = await prisma.link.findUnique({
    where: { shortCode },
    include: { file: true },
  })

  if (!link) {
    notFound()
  }

  // Si c'est une prévisualisation, afficher l'aperçu Open Graph
  if (preview === "true") {
    return (
      <OpenGraphPreview
        link={{
          id: link.id,
          shortCode: link.shortCode,
          originalUrl: link.originalUrl,
          description: link.description,
          openGraph: {
            title: link.ogTitle,
            description: link.ogDescription,
            image: link.ogImage,
          },
          clicks: await prisma.click.count({ where: { linkId: link.id } }),
          hasPassword: !!link.password,
          expirationDate: link.expirationDate?.toISOString(),
          createdAt: link.createdAt.toISOString(),
        }}
      />
    )
  }

  // Vérifier si le lien est actif
  if (!link.isActive) {
    return <RedirectPage error="Ce lien a expiré" />
  }

  // Vérifier la date d'expiration
  if (link.expirationDate && new Date() > link.expirationDate) {
    await prisma.link.update({
      where: { id: link.id },
      data: { isActive: false },
    })
    return <RedirectPage error="Ce lien a expiré" />
  }

  // Vérifier le nombre maximum de clics
  if (link.maxClicks) {
    const clickCount = await prisma.click.count({ where: { linkId: link.id } })
    if (clickCount >= link.maxClicks) {
      await prisma.link.update({
        where: { id: link.id },
        data: { isActive: false },
      })
      return <RedirectPage error="Ce lien a atteint sa limite de clics" />
    }
  }

  // Vérifier le mot de passe
  if (link.password && password !== link.password) {
    return (
      <RedirectPage
        link={{
          shortCode: link.shortCode,
          description: link.description,
          originalUrl: link.originalUrl,
        }}
        requirePassword
      />
    )
  }

  // Enregistrer les statistiques de clic
  try {
    const headersList = await headers()
    const userAgent = headersList.get("user-agent") || ""
    const referer = headersList.get("referer")

    // Simuler l'IP (dans un vrai déploiement, utiliser la vraie IP)
    const ipAddress = "127.0.0.1" // getClientIP(request)
    const location = await getLocationFromIP(ipAddress)
    const deviceInfo = parseUserAgent(userAgent)

    await prisma.click.create({
      data: {
        linkId: link.id,
        ipAddress,
        userAgent,
        referer,
        country: location.country,
        city: location.city,
        device: deviceInfo.device,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
      },
    })
  } catch (error) {
    console.error("Error recording click:", error)
  }

  // Rediriger vers l'URL cible
  if (link.originalUrl.startsWith("/download/")) {
    // Redirection vers la page de téléchargement
    redirect(link.originalUrl)
  } else {
    // Redirection externe
    redirect(link.originalUrl)
  }
}
