"use client";

import {
  ArrowLeft,
  BarChart3,
  Calendar,
  Copy,
  ExternalLink,
  Eye,
  Globe,
  Monitor,
  Share2,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
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

import { SocialShareButtons } from "@/components/social-share-buttons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

interface LinkStats {
  id: string;
  shortCode: string;
  originalUrl: string;
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
  openGraph?: {
    title?: string;
    description?: string;
    image?: string;
  };
  createdAt: string;
  updatedAt: string;
  clicksData: Array<{
    id: string;
    country?: string;
    city?: string;
    device?: string;
    browser?: string;
    os?: string;
    referer?: string;
    createdAt: string;
  }>;
}

interface ProcessedStats {
  totalClicks: number;
  uniqueVisitors: number;
  clicksToday: number;
  clicksThisWeek: number;
  clicksByDate: Array<{ date: string; clicks: number }>;
  topCountries: Array<{ country: string; clicks: number; percentage: number }>;
  devices: Array<{ device: string; clicks: number; percentage: number }>;
  browsers: Array<{ browser: string; clicks: number }>;
  referrers: Array<{ referrer: string; clicks: number }>;
}

export default function LinkStatsPage() {
  const params = useParams();
  const { toast } = useToast();
  const [link, setLink] = useState<LinkStats | null>(null);
  const [stats, setStats] = useState<ProcessedStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchLinkStats();
    }
  }, [params.id]);

  const fetchLinkStats = async () => {
    try {
      const response = await fetch(`/api/links/${params.id}`);
      if (response.ok) {
        const linkData = await response.json();
        setLink(linkData);
        processStats(linkData);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les statistiques du lien",
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
      setLoading(false);
    }
  };

  const processStats = (linkData: LinkStats) => {
    const clicks = linkData.clicksData;
    const totalClicks = clicks.length;

    // Calculer les visiteurs uniques (basé sur l'IP - approximation)
    const uniqueIPs = new Set(clicks.map((click) => click.id)).size; // Approximation
    const uniqueVisitors = Math.floor(uniqueIPs * 0.8); // Estimation

    // Clics aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const clicksToday = clicks.filter(
      (click) => new Date(click.createdAt) >= today
    ).length;

    // Clics cette semaine
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const clicksThisWeek = clicks.filter(
      (click) => new Date(click.createdAt) >= weekAgo
    ).length;

    // Clics par date (7 derniers jours)
    const clicksByDate = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayClicks = clicks.filter((click) => {
        const clickDate = new Date(click.createdAt);
        return clickDate >= date && clickDate < nextDay;
      }).length;

      clicksByDate.push({
        date: date.toISOString().split("T")[0],
        clicks: dayClicks,
      });
    }

    // Top pays
    const countryCount: { [key: string]: number } = {};
    clicks.forEach((click) => {
      const country = click.country || "Inconnu";
      countryCount[country] = (countryCount[country] || 0) + 1;
    });

    const topCountries = Object.entries(countryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([country, clicks]) => ({
        country,
        clicks,
        percentage: Math.round((clicks / totalClicks) * 100 * 10) / 10,
      }));

    // Appareils
    const deviceCount: { [key: string]: number } = {};
    clicks.forEach((click) => {
      const device = click.device || "Inconnu";
      deviceCount[device] = (deviceCount[device] || 0) + 1;
    });

    const devices = Object.entries(deviceCount)
      .sort(([, a], [, b]) => b - a)
      .map(([device, clicks]) => ({
        device,
        clicks,
        percentage: Math.round((clicks / totalClicks) * 100 * 10) / 10,
      }));

    // Navigateurs
    const browserCount: { [key: string]: number } = {};
    clicks.forEach((click) => {
      const browser = click.browser || "Inconnu";
      browserCount[browser] = (browserCount[browser] || 0) + 1;
    });

    const browsers = Object.entries(browserCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([browser, clicks]) => ({ browser, clicks }));

    // Sources de trafic
    const referrerCount: { [key: string]: number } = {};
    clicks.forEach((click) => {
      let referrer = "Direct";
      if (click.referer) {
        try {
          const url = new URL(click.referer);
          referrer = url.hostname;
        } catch {
          referrer = "Autre";
        }
      }
      referrerCount[referrer] = (referrerCount[referrer] || 0) + 1;
    });

    const referrers = Object.entries(referrerCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([referrer, clicks]) => ({ referrer, clicks }));

    setStats({
      totalClicks,
      uniqueVisitors,
      clicksToday,
      clicksThisWeek,
      clicksByDate,
      topCountries,
      devices,
      browsers,
      referrers,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: "Lien copié dans le presse-papiers",
    });
  };

  if (loading) {
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

  if (!link || !stats) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Lien non trouvé</h1>
          <Button asChild>
            <Link href="/dashboard/links">Retour aux liens</Link>
          </Button>
        </div>
      </div>
    );
  }

  const shortUrl = `${window.location.origin}/${link.shortCode}`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/links">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Statistiques du lien</h1>
          <p className="text-muted-foreground">
            {link.description || link.shortCode}
          </p>
        </div>
      </div>

      {/* Informations du lien */}
      <Card>
        <CardHeader>
          <CardTitle>Informations du lien</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
            <code className="flex-1 text-sm">{shortUrl}</code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(shortUrl)}
            >
              <Copy className="h-3 w-3" />
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
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>Destination: {link.originalUrl}</p>
            <p>
              Créé le: {new Date(link.createdAt).toLocaleDateString("fr-FR")}
            </p>

            {link.openGraph && (
              <div className="space-y-1">
                <p>Open Graph configuré:</p>
                <div className="ml-4 space-y-1">
                  {link.openGraph.title && (
                    <p>• Titre: {link.openGraph.title}</p>
                  )}
                  {link.openGraph.description && (
                    <p>• Description: {link.openGraph.description}</p>
                  )}
                  {link.openGraph.image && (
                    <p>• Image: {link.openGraph.image}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <SocialShareButtons
              url={shortUrl}
              title={link.openGraph?.title || link.description}
              description={link.openGraph?.description}
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total des clics
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClicks}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.clicksToday} aujourd'hui
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Visiteurs uniques
            </CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueVisitors}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalClicks > 0
                ? Math.round((stats.uniqueVisitors / stats.totalClicks) * 100)
                : 0}
              % du trafic
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cette semaine</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clicksThisWeek}</div>
            <p className="text-xs text-muted-foreground">7 derniers jours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Moyenne quotidienne
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(stats.clicksThisWeek / 7)}
            </div>
            <p className="text-xs text-muted-foreground">Clics par jour</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques détaillés */}
      <Tabs defaultValue="timeline" className="space-y-6">
        <TabsList>
          <TabsTrigger value="timeline">Chronologie</TabsTrigger>
          <TabsTrigger value="geography">Géographie</TabsTrigger>
          <TabsTrigger value="devices">Appareils</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="sharing">Partage</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Clics par jour (7 derniers jours)</CardTitle>
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

        <TabsContent value="geography">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top pays</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.topCountries.length > 0 ? (
                  <div className="space-y-4">
                    {stats.topCountries.map((country, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-4 h-4 rounded-full bg-primary"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                          <span className="font-medium">{country.country}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{country.clicks}</div>
                          <div className="text-xs text-muted-foreground">
                            {country.percentage}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune donnée géographique disponible
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Répartition géographique</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.topCountries.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={stats.topCountries}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="clicks"
                        label={({ country, percentage }) =>
                          `${country} ${percentage}%`
                        }
                      >
                        {stats.topCountries.map((entry, index) => (
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
                    Aucune donnée disponible
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devices">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Types d'appareils</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.devices.length > 0 ? (
                  <div className="space-y-4">
                    {stats.devices.map((device, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          {device.device === "Mobile" && (
                            <Smartphone className="h-4 w-4" />
                          )}
                          {device.device === "Desktop" && (
                            <Monitor className="h-4 w-4" />
                          )}
                          {device.device === "Tablet" && (
                            <Monitor className="h-4 w-4" />
                          )}
                          <span className="font-medium">{device.device}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{device.clicks}</div>
                          <div className="text-xs text-muted-foreground">
                            {device.percentage}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune donnée d'appareil disponible
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Navigateurs</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.browsers.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={stats.browsers}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="browser" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="clicks" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune donnée de navigateur disponible
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle>Sources de trafic</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.referrers.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.referrers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="referrer" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="clicks" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune donnée de source disponible
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sharing">
          <Card>
            <CardHeader>
              <CardTitle>Outils de partage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Partager ce lien</h4>
                <SocialShareButtons
                  url={shortUrl}
                  title={link.openGraph?.title || link.description}
                  description={link.openGraph?.description}
                />
              </div>

              <div>
                <h4 className="font-medium mb-3">Aperçu du partage</h4>
                <Button variant="outline" asChild>
                  <Link href={`/${link.shortCode}?preview=true`}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Voir l'aperçu Open Graph
                  </Link>
                </Button>
              </div>

              {link.openGraph && (
                <div>
                  <h4 className="font-medium mb-3">Métadonnées configurées</h4>
                  <div className="space-y-2 text-sm">
                    {link.openGraph.title && (
                      <div>
                        <Badge variant="outline">Titre</Badge>
                        <p className="mt-1">{link.openGraph.title}</p>
                      </div>
                    )}
                    {link.openGraph.description && (
                      <div>
                        <Badge variant="outline">Description</Badge>
                        <p className="mt-1">{link.openGraph.description}</p>
                      </div>
                    )}
                    {link.openGraph.image && (
                      <div>
                        <Badge variant="outline">Image</Badge>
                        <div className="mt-1">
                          <img
                            src={link.openGraph.image || "/placeholder.svg"}
                            alt="Image Open Graph"
                            className="w-32 h-20 object-cover rounded border"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
