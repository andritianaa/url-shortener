"use client";

import {
  BarChart3,
  Calendar,
  LinkIcon,
  Mail,
  Settings,
  Shield,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface UserStats {
  totalLinks: number;
  totalClicks: number;
  activeLinks: number;
  joinDate: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const response = await fetch("/api/user/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques du profil",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              {user?.name || "Utilisateur"}
            </h1>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/dashboard/settings">
            <Settings className="h-4 w-4 mr-2" />
            Modifier le profil
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Nom complet</p>
                <p className="font-medium">{user?.name || "Non renseigné"}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Adresse email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Rôle</p>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={user?.role === "ADMIN" ? "default" : "secondary"}
                  >
                    {user?.role === "ADMIN" ? "Administrateur" : "Utilisateur"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Membre depuis</p>
                <p className="font-medium">
                  {stats?.joinDate
                    ? new Date(stats.joinDate).toLocaleDateString("fr-FR")
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques */}
        <Card>
          <CardHeader>
            <CardTitle>Vos statistiques</CardTitle>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <LinkIcon className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">{stats.totalLinks}</p>
                  <p className="text-sm text-muted-foreground">Liens créés</p>
                </div>

                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">{stats.totalClicks}</p>
                  <p className="text-sm text-muted-foreground">Total clics</p>
                </div>

                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="w-6 h-6 bg-green-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-2xl font-bold">{stats.activeLinks}</p>
                  <p className="text-sm text-muted-foreground">Liens actifs</p>
                </div>

                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-2xl font-bold">
                    {stats.totalLinks > 0
                      ? Math.round(stats.totalClicks / stats.totalLinks)
                      : 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Clics/lien</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Impossible de charger les statistiques
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              asChild
              variant="outline"
              className="h-auto p-4 bg-transparent"
            >
              <Link
                href="/dashboard/create"
                className="flex flex-col items-center space-y-2"
              >
                <LinkIcon className="h-6 w-6" />
                <span>Créer un lien</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-auto p-4 bg-transparent"
            >
              <Link
                href="/dashboard/links"
                className="flex flex-col items-center space-y-2"
              >
                <BarChart3 className="h-6 w-6" />
                <span>Voir mes liens</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-auto p-4 bg-transparent"
            >
              <Link
                href="/dashboard/stats"
                className="flex flex-col items-center space-y-2"
              >
                <BarChart3 className="h-6 w-6" />
                <span>Statistiques</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
