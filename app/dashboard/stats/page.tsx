"use client";

import { BarChart3, Eye, LinkIcon, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

interface GlobalStats {
  totalLinks: number;
  totalClicks: number;
  clicksToday: number;
  activeLinks: number;
  clicksByDate: Array<{ date: string; clicks: number }>;
  topLinks: Array<{ shortCode: string; description?: string; clicks: number }>;
  deviceStats: Array<{ device: string; clicks: number; percentage: number }>;
  countryStats: Array<{ country: string; clicks: number; percentage: number }>;
}

export default function StatsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchGlobalStats();
    }
  }, [user]);

  const fetchGlobalStats = async () => {
    try {
      const response = await fetch("/api/dashboard/global-stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les statistiques globales",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des données",
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Erreur de chargement</h1>
          <p className="text-muted-foreground">
            Impossible de charger les statistiques
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Statistiques globales</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de tous vos liens
        </p>
      </div>

      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              {stats.activeLinks} actifs
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
              Tous vos liens confondus
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clics aujourd'hui
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clicksToday}</div>
            <p className="text-xs text-muted-foreground">Activité du jour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Moyenne par lien
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalLinks > 0
                ? Math.round(stats.totalClicks / stats.totalLinks)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">Clics par lien</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques détaillés */}
      <Tabs defaultValue="timeline" className="space-y-6">
        <TabsList>
          <TabsTrigger value="timeline">Chronologie</TabsTrigger>
          <TabsTrigger value="top-links">Top liens</TabsTrigger>
          <TabsTrigger value="devices">Appareils</TabsTrigger>
          <TabsTrigger value="geography">Géographie</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des clics (30 derniers jours)</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.clicksByDate.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.clicksByDate}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("fr-FR", {
                          month: "short",
                          day: "numeric",
                        })
                      }
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) =>
                        new Date(value).toLocaleDateString("fr-FR")
                      }
                      formatter={(value) => [value, "Clics"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="clicks"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune donnée disponible
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top-links">
          <Card>
            <CardHeader>
              <CardTitle>Liens les plus populaires</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topLinks.length > 0 ? (
                <div className="space-y-4">
                  {stats.topLinks.map((link, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                          <span className="text-sm font-bold text-primary">
                            #{index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {link.description || `/${link.shortCode}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            /{link.shortCode}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{link.clicks}</p>
                        <p className="text-xs text-muted-foreground">clics</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun lien disponible
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle>Répartition par appareil</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.deviceStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.deviceStats}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="clicks"
                      label={({ device, percentage }) =>
                        `${device} ${percentage}%`
                      }
                    >
                      {stats.deviceStats.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune donnée d'appareil disponible
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography">
          <Card>
            <CardHeader>
              <CardTitle>Répartition géographique</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.countryStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.countryStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="country" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="clicks" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune donnée géographique disponible
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
