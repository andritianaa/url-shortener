"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useToast } from "@/hooks/use-toast"
import { CalendarIcon, Upload, LinkIcon, Copy, ExternalLink, ChevronDown, Share2 } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { QRCodeSVG } from "qrcode.react"

interface ShortenedUrl {
  shortUrl: string
  originalUrl: string
  shortCode: string
  qrCode?: string
  clicks: number
  createdAt: string
}

export function UrlShortenerForm() {
  const [url, setUrl] = useState("")
  const [customAlias, setCustomAlias] = useState("")
  const [password, setPassword] = useState("")
  const [description, setDescription] = useState("")
  const [expirationDate, setExpirationDate] = useState<Date>()
  const [maxClicks, setMaxClicks] = useState("")
  const [file, setFile] = useState<File | null>(null)

  // Open Graph fields
  const [ogTitle, setOgTitle] = useState("")
  const [ogDescription, setOgDescription] = useState("")
  const [ogImage, setOgImage] = useState("")
  const [showOpenGraph, setShowOpenGraph] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ShortenedUrl | null>(null)
  const [usePassword, setUsePassword] = useState(false)
  const [useExpiration, setUseExpiration] = useState(false)
  const [useMaxClicks, setUseMaxClicks] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url && !file) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une URL ou sélectionner un fichier",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      if (url) formData.append("url", url)
      if (customAlias) formData.append("customAlias", customAlias)
      if (usePassword && password) formData.append("password", password)
      if (description) formData.append("description", description)
      if (useExpiration && expirationDate) {
        formData.append("expirationDate", expirationDate.toISOString())
      }
      if (useMaxClicks && maxClicks) formData.append("maxClicks", maxClicks)
      if (file) formData.append("file", file)

      // Open Graph data
      if (ogTitle) formData.append("ogTitle", ogTitle)
      if (ogDescription) formData.append("ogDescription", ogDescription)
      if (ogImage) formData.append("ogImage", ogImage)

      const response = await fetch("/api/shorten", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la création du lien")
      }

      const data = await response.json()
      setResult(data)

      // Reset form
      setUrl("")
      setCustomAlias("")
      setPassword("")
      setDescription("")
      setExpirationDate(undefined)
      setMaxClicks("")
      setFile(null)
      setOgTitle("")
      setOgDescription("")
      setOgImage("")
      setUsePassword(false)
      setUseExpiration(false)
      setUseMaxClicks(false)
      setShowOpenGraph(false)

      toast({
        title: "Succès",
        description: "Lien raccourci créé avec succès !",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le lien raccourci",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copié",
      description: "Lien copié dans le presse-papiers",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <LinkIcon className="h-5 w-5" />
            <span>Créer un lien court</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="url" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url">URL</TabsTrigger>
              <TabsTrigger value="file">Fichier</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              <TabsContent value="url" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">URL à raccourcir</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com/very-long-url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="text-base"
                  />
                </div>
              </TabsContent>

              <TabsContent value="file" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Fichier à partager</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="file"
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="text-base"
                    />
                    <Upload className="h-4 w-4 text-muted-foreground" />
                  </div>
                  {file && (
                    <p className="text-sm text-muted-foreground">
                      Fichier sélectionné: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              </TabsContent>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="alias">Alias personnalisé (optionnel)</Label>
                  <Input
                    id="alias"
                    placeholder="mon-lien-custom"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optionnel)</Label>
                  <Input
                    id="description"
                    placeholder="Description du lien"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Open Graph Section */}
              <Collapsible open={showOpenGraph} onOpenChange={setShowOpenGraph}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between bg-transparent" type="button">
                    <div className="flex items-center space-x-2">
                      <Share2 className="h-4 w-4" />
                      <span>Personnaliser l'aperçu de partage (Open Graph)</span>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", showOpenGraph && "rotate-180")} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 gap-4 p-4 border rounded-lg bg-muted/50">
                    <div className="space-y-2">
                      <Label htmlFor="og-title">Titre de l'aperçu</Label>
                      <Input
                        id="og-title"
                        placeholder="Titre qui apparaîtra lors du partage"
                        value={ogTitle}
                        onChange={(e) => setOgTitle(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="og-description">Description de l'aperçu</Label>
                      <Textarea
                        id="og-description"
                        placeholder="Description qui apparaîtra lors du partage"
                        value={ogDescription}
                        onChange={(e) => setOgDescription(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="og-image">URL de l'image d'aperçu</Label>
                      <Input
                        id="og-image"
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={ogImage}
                        onChange={(e) => setOgImage(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Image qui apparaîtra lors du partage sur les réseaux sociaux
                      </p>
                    </div>

                    {/* Aperçu Open Graph */}
                    {(ogTitle || ogDescription || ogImage) && (
                      <div className="space-y-2">
                        <Label>Aperçu du partage</Label>
                        <div className="border rounded-lg p-3 bg-background">
                          {ogImage && (
                            <div className="mb-3">
                              <img
                                src={ogImage || "/placeholder.svg"}
                                alt="Aperçu"
                                className="w-full h-32 object-cover rounded"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none"
                                }}
                              />
                            </div>
                          )}
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm">{ogTitle || "Titre de votre lien"}</h4>
                            <p className="text-xs text-muted-foreground">
                              {ogDescription || "Description de votre lien"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {window.location.origin}/{customAlias || "abc123"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Options avancées */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium">Options avancées</h3>

                <div className="flex items-center space-x-2">
                  <Switch id="use-password" checked={usePassword} onCheckedChange={setUsePassword} />
                  <Label htmlFor="use-password">Protection par mot de passe</Label>
                </div>

                {usePassword && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch id="use-expiration" checked={useExpiration} onCheckedChange={setUseExpiration} />
                  <Label htmlFor="use-expiration">Date d'expiration</Label>
                </div>

                {useExpiration && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !expirationDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {expirationDate ? (
                          format(expirationDate, "PPP", { locale: fr })
                        ) : (
                          <span>Sélectionner une date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={expirationDate}
                        onSelect={setExpirationDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}

                <div className="flex items-center space-x-2">
                  <Switch id="use-max-clicks" checked={useMaxClicks} onCheckedChange={setUseMaxClicks} />
                  <Label htmlFor="use-max-clicks">Limite de clics</Label>
                </div>

                {useMaxClicks && (
                  <div className="space-y-2">
                    <Label htmlFor="max-clicks">Nombre maximum de clics</Label>
                    <Input
                      id="max-clicks"
                      type="number"
                      placeholder="100"
                      value={maxClicks}
                      onChange={(e) => setMaxClicks(e.target.value)}
                      min="1"
                    />
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Création en cours..." : "Créer le lien court"}
              </Button>
            </form>
          </Tabs>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LinkIcon className="h-5 w-5 text-green-600" />
              <span>Lien créé avec succès !</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
              <Input value={result.shortUrl} readOnly className="flex-1 bg-transparent border-none" />
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(result.shortUrl)}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href={result.shortUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>URL originale</Label>
                <p className="text-sm text-muted-foreground break-all">{result.originalUrl}</p>
              </div>

              <div className="space-y-2">
                <Label>Statistiques</Label>
                <p className="text-sm text-muted-foreground">
                  {result.clicks} clic(s) • Créé le {format(new Date(result.createdAt), "PPP", { locale: fr })}
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg border">
                <QRCodeSVG value={result.shortUrl} size={128} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
