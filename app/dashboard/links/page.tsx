"use client";

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    BarChart3, Calendar, Copy, Download, ExternalLink, Eye, LinkIcon, Plus, Share2, Trash2
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

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
  fileInfo?: {
    filename: string;
    originalName: string;
    size: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function LinksPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [links, setLinks] = useState<LinkData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user) {
      fetchLinks();
    }
  }, [user]);

  const fetchLinks = async () => {
    try {
      const response = await fetch("/api/links");
      if (response.ok) {
        const data = await response.json();
        setLinks(data);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les liens",
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

  const deleteLink = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce lien ?")) return;

    try {
      const response = await fetch(`/api/links/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setLinks(links.filter((link) => link.id !== id));
        toast({
          title: "Succès",
          description: "Lien supprimé avec succès",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le lien",
        variant: "destructive",
      });
    }
  };

  const filteredLinks = links.filter(
    (link) =>
      link.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.shortCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-10 bg-muted rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
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
          <h1 className="text-3xl font-bold">Mes liens</h1>
          <p className="text-muted-foreground">
            Gérez tous vos liens raccourcis
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/create">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau lien
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <Input
          placeholder="Rechercher dans vos liens..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Links List */}
      <Card>
        <CardHeader>
          <CardTitle>Vos liens ({filteredLinks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLinks.length === 0 ? (
            <div className="text-center py-8">
              <LinkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun lien trouvé</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "Aucun lien ne correspond à votre recherche"
                  : "Commencez par créer votre premier lien"}
              </p>
              <Button asChild>
                <Link href="/dashboard/create">Créer un lien</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLinks.map((link) => (
                <div key={link.id} className="border rounded-lg p-4 space-y-3">
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
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/dashboard/links/${link.id}/stats`}>
                          <BarChart3 className="h-3 w-3" />
                        </Link>
                      </Button>

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

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteLink(link.id)}
                      >
                        <Trash2 className="h-3 w-3" />
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
