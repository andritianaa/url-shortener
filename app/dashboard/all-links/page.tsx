"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  BarChart3,
  Calendar,
  Copy,
  Download,
  Edit,
  ExternalLink,
  Eye,
  Globe,
  LinkIcon,
  Plus,
  Share2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface LinkData {
  id: string;
  shortCode: string;
  originalUrl: string;
  customAlias?: string;
  description?: string;
  clicks: number;
  isActive: boolean;
  hasPassword: boolean;
  expirationDate?: string;
  maxClicks?: number;
  isPublic: boolean;
  canEdit: boolean;
  canViewStats: boolean;
  fileInfo?: {
    filename: string;
    originalName: string;
    size: number;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalLinks: number;
  activeLinks: number;
  totalClicks: number;
}

export default function AllLinksPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [links, setLinks] = useState<LinkData[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalLinks: 0,
    activeLinks: 0,
    totalClicks: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user) {
      fetchPublicLinks();
    }
  }, [user]);

  const fetchPublicLinks = async () => {
    try {
      const response = await fetch("/api/links/public");
      if (response.ok) {
        const data = await response.json();
        setLinks(data.links);
        setStats(data.stats);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les liens publics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: "Lien copié dans le presse-papiers",
    });
  };

  const filteredLinks = links.filter(
    (link) =>
      link.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.shortCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Globe className="h-8 w-8" />
            <span>Tous les liens</span>
          </h1>
          <p className="text-muted-foreground">
            Découvrez les liens partagés par la communauté
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/create">
            <Plus className="h-4 w-4 mr-2" />
            Créer un lien
          </Link>
        </Button>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total des liens
            </CardTitle>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLinks}</div>
            <p className="text-xs text-muted-foreground">
              Liens publics partagés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Liens actifs</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLinks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalLinks > 0
                ? Math.round((stats.activeLinks / stats.totalLinks) * 100)
                : 0}
              % du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total des clics
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClicks}</div>
            <p className="text-xs text-muted-foreground">
              Clics sur tous les liens
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <Input
          placeholder="Rechercher par lien, description, ou utilisateur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Links List */}
      <Card>
        <CardHeader>
          <CardTitle>Liens publics ({filteredLinks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLinks.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Aucun Lien partagé trouvé
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "Aucun lien ne correspond à votre recherche"
                  : "Aucun Lien partagé n'a été partagé pour le moment"}
              </p>
              <Button asChild>
                <Link href="/dashboard/create">
                  Créer le premier Lien partagé
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLinks.map((link) => (
                <div
                  key={link.id}
                  className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium truncate">
                          {link.description || link.shortCode}
                        </h3>
                        <div className="flex items-center space-x-1">
                          {!link.isActive && (
                            <Badge variant="secondary">Expiré</Badge>
                          )}
                          {link.hasPassword && (
                            <Badge variant="outline">Protégé</Badge>
                          )}
                          {link.fileInfo && (
                            <Badge variant="outline">Fichier</Badge>
                          )}
                          {link.canEdit && (
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Modifiable
                            </Badge>
                          )}
                          {link.canViewStats && (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700"
                            >
                              <BarChart3 className="h-3 w-3 mr-1" />
                              Stats publiques
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono bg-muted px-2 py-1 rounded">
                            {window.location.origin}/{link.shortCode}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              copyToClipboard(
                                `${window.location.origin}/${link.shortCode}`
                              )
                            }
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>

                        <p className="truncate">→ {link.originalUrl}</p>

                        <div className="flex items-center space-x-2">
                          <Users className="h-3 w-3" />
                          <span>Par {link.user.name || link.user.email}</span>
                        </div>

                        {link.fileInfo && (
                          <p className="flex items-center space-x-1">
                            <Download className="h-3 w-3" />
                            <span>
                              {link.fileInfo.originalName} (
                              {(link.fileInfo.size / 1024 / 1024).toFixed(2)}{" "}
                              MB)
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {(link.canViewStats ||
                        link.user.id === user?.id ||
                        user?.role === "ADMIN") && (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/dashboard/links/${link.id}/stats`}>
                            <BarChart3 className="h-3 w-3" />
                          </Link>
                        </Button>
                      )}

                      <Button size="sm" variant="outline" asChild>
                        <a
                          href={`/${link.shortCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>

                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/${link.shortCode}?preview=true`}>
                          <Share2 className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{link.clicks} clics</span>
                      </span>

                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Créé le{" "}
                          {format(new Date(link.createdAt), "PPP", {
                            locale: fr,
                          })}
                        </span>
                      </span>

                      {link.expirationDate && (
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Expire le{" "}
                            {format(new Date(link.expirationDate), "PPP", {
                              locale: fr,
                            })}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
