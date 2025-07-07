"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, AlertTriangle } from "lucide-react"

interface RedirectPageProps {
  link?: {
    shortCode: string
    description?: string
    originalUrl: string
  }
  requirePassword?: boolean
  error?: string
}

export function RedirectPage({ link, requirePassword, error }: RedirectPageProps) {
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Rediriger avec le mot de passe
    const url = new URL(window.location.href)
    url.searchParams.set("password", password)
    router.push(url.toString())
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Lien inaccessible</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button className="mt-4" onClick={() => router.push("/")}>
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (requirePassword && link) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Lock className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <CardTitle>Lien protégé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground text-center">
                {link.description || "Ce lien est protégé par un mot de passe"}
              </p>
              <div className="mt-2 p-2 bg-muted rounded text-center">
                <code className="text-sm">{link.originalUrl}</code>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Entrez le mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Vérification..." : "Accéder au lien"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
