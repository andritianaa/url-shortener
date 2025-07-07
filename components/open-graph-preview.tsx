"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Share2, ExternalLink, Eye, Calendar, Lock } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"

interface OpenGraphPreviewProps {
  link: {
    id: string
    shortCode: string
    originalUrl: string
    description?: string
    openGraph?: {
      title?: string
      description?: string
      image?: string
    }
    clicks: number
    hasPassword: boolean
    expirationDate?: string
    createdAt: string
  }
}

export function OpenGraphPreview({ link }: OpenGraphPreviewProps) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  const shortUrl = `${baseUrl}/${link.shortCode}`

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Aperçu Open Graph */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Share2 className="h-5 w-5" />
              <span>Aperçu du partage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden bg-background">
              {link.openGraph?.image && (
                <div className="aspect-video w-full">
                  <img
                    src={link.openGraph.image || "/placeholder.svg"}
                    alt="Aperçu Open Graph"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-lg">
                  {link.openGraph?.title || link.description || "Lien raccourci"}
                </h3>
                <p className="text-muted-foreground">
                  {link.openGraph?.description || "Cliquez pour accéder au contenu"}
                </p>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>{shortUrl}</span>
                  <div className="flex items-center space-x-1">
                    {link.hasPassword && <Lock className="h-3 w-3" />}
                    <Eye className="h-3 w-3" />
                    <span>{link.clicks}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations du lien */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du lien</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Lien court</h4>
                <code className="text-sm bg-muted p-2 rounded block">{shortUrl}</code>
              </div>
              <div>
                <h4 className="font-medium mb-2">Destination</h4>
                <p className="text-sm text-muted-foreground break-all">{link.originalUrl}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {link.hasPassword && <Badge variant="outline">Protégé</Badge>}
              {link.expirationDate && (
                <Badge variant="outline">
                  Expire le {format(new Date(link.expirationDate), "PPP", { locale: fr })}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>{link.clicks} clics</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>Créé le {format(new Date(link.createdAt), "PPP", { locale: fr })}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-4">
              <Button asChild>
                <Link href={`/${link.shortCode}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Accéder au lien
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">Retour au dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Exemples de partage */}
        <Card>
          <CardHeader>
            <CardTitle>Aperçu sur les réseaux sociaux</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium">Facebook / LinkedIn</h4>
              <div className="border rounded-lg p-3 bg-[#f0f2f5] dark:bg-gray-800">
                {link.openGraph?.image && (
                  <img
                    src={link.openGraph.image || "/placeholder.svg"}
                    alt="Aperçu Facebook"
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                )}
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase">{new URL(shortUrl).hostname}</p>
                  <h5 className="font-semibold text-sm">
                    {link.openGraph?.title || link.description || "Lien raccourci"}
                  </h5>
                  <p className="text-xs text-gray-600">
                    {link.openGraph?.description || "Cliquez pour accéder au contenu"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Twitter / X</h4>
              <div className="border rounded-lg p-3 bg-black text-white">
                <div className="space-y-2">
                  <p className="text-sm">Découvrez ce lien intéressant : {shortUrl}</p>
                  {link.openGraph?.image && (
                    <img
                      src={link.openGraph.image || "/placeholder.svg"}
                      alt="Aperçu Twitter"
                      className="w-full h-32 object-cover rounded"
                    />
                  )}
                  <div className="border border-gray-600 rounded p-2">
                    <h6 className="font-semibold text-sm">
                      {link.openGraph?.title || link.description || "Lien raccourci"}
                    </h6>
                    <p className="text-xs text-gray-400">
                      {link.openGraph?.description || "Cliquez pour accéder au contenu"}
                    </p>
                    <p className="text-xs text-gray-500">{new URL(shortUrl).hostname}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
