"use client";

import {
    ArrowLeft, BarChart3, Calendar, Copy, ExternalLink, Eye, Globe, Monitor, Share2, Smartphone
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer,
    Tooltip, XAxis, YAxis
} from 'recharts';

import { SocialShareButtons } from '@/components/social-share-buttons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Données simulées pour la démo
const mockStats = {
  totalClicks: 1247,
  uniqueVisitors: 892,
  clicksToday: 45,
  clicksThisWeek: 312,
  clicksByDate: [
    { date: "2024-01-01", clicks: 23 },
    { date: "2024-01-02", clicks: 45 },
    { date: "2024-01-03", clicks: 67 },
    { date: "2024-01-04", clicks: 34 },
    { date: "2024-01-05", clicks: 56 },
    { date: "2024-01-06", clicks: 78 },
    { date: "2024-01-07", clicks: 45 },
  ],
  topCountries: [
    { country: "France", clicks: 456, percentage: 36.6 },
    { country: "Canada", clicks: 234, percentage: 18.8 },
    { country: "Belgique", clicks: 123, percentage: 9.9 },
    { country: "Suisse", clicks: 89, percentage: 7.1 },
    { country: "Autres", clicks: 345, percentage: 27.6 },
  ],
  devices: [
    { device: "Mobile", clicks: 678, percentage: 54.4 },
    { device: "Desktop", clicks: 456, percentage: 36.6 },
    { device: "Tablet", clicks: 113, percentage: 9.0 },
  ],
  browsers: [
    { browser: "Chrome", clicks: 567 },
    { browser: "Safari", clicks: 234 },
    { browser: "Firefox", clicks: 156 },
    { browser: "Edge", clicks: 123 },
    { browser: "Autres", clicks: 167 },
  ],
  referrers: [
    { referrer: "Direct", clicks: 456 },
    { referrer: "Google", clicks: 234 },
    { referrer: "Facebook", clicks: 123 },
    { referrer: "Twitter", clicks: 89 },
    { referrer: "LinkedIn", clicks: 67 },
  ],
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function LinkStatsPage() {
  const params = useParams();
  const { toast } = useToast();
  const [link, setLink] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement des données du lien
    setTimeout(() => {
      setLink({
        id: params.id,
        shortCode: "abc123",
        originalUrl: "https://example.com/very-long-url",
        description: "Mon lien de test",
        clicks: mockStats.totalClicks,
        createdAt: "2024-01-01T00:00:00Z",
        openGraph: {
          title: "Mon super article",
          description:
            "Découvrez cet article incroyable sur le développement web",
          image:
            "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&h=300&fit=crop",
        },
      });
      setLoading(false);
    }, 1000);
  }, [params.id]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: "Lien copié dans le presse-papiers",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
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

  const shortUrl = `${window.location.origin}/${link?.shortCode}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-4 mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Statistiques du lien</h1>
          <p className="text-muted-foreground">
            {link?.description || link?.shortCode}
          </p>
        </div>
      </div>

      {/* Informations du lien */}
      <Card className="mb-8">
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
                href={`/${link?.shortCode}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/${link?.shortCode}?preview=true`}>
                <Share2 className="h-3 w-3" />
              </Link>
            </Button>
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>Destination: {link?.originalUrl}</p>
            <p>
              Créé le: {new Date(link?.createdAt).toLocaleDateString("fr-FR")}
            </p>

            {link?.openGraph && (
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
              title={link?.openGraph?.title || link?.description}
              description={link?.openGraph?.description}
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total des clics
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalClicks}</div>
            <p className="text-xs text-muted-foreground">
              +{mockStats.clicksToday} aujourd'hui
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
            <div className="text-2xl font-bold">{mockStats.uniqueVisitors}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                (mockStats.uniqueVisitors / mockStats.totalClicks) * 100
              )}
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
            <div className="text-2xl font-bold">{mockStats.clicksThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.round(((mockStats.clicksThisWeek - 200) / 200) * 100)}% vs
              semaine dernière
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de clic</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(mockStats.clicksThisWeek / 7)}
            </div>
            <p className="text-xs text-muted-foreground">
              Clics par jour en moyenne
            </p>
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
              <CardTitle>Clics par jour</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockStats.clicksByDate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
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
                <div className="space-y-4">
                  {mockStats.topCountries.map((country, index) => (
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Répartition géographique</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={mockStats.topCountries}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="clicks"
                      label={({ country, percentage }) =>
                        `${country} ${percentage}%`
                      }
                    >
                      {mockStats.topCountries.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
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
                <div className="space-y-4">
                  {mockStats.devices.map((device, index) => (
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Navigateurs</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={mockStats.browsers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="browser" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="clicks" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockStats.referrers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="referrer" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="clicks" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
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
                  title={link?.openGraph?.title || link?.description}
                  description={link?.openGraph?.description}
                />
              </div>

              <div>
                <h4 className="font-medium mb-3">Aperçu du partage</h4>
                <Button variant="outline" asChild>
                  <Link href={`/${link?.shortCode}?preview=true`}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Voir l'aperçu Open Graph
                  </Link>
                </Button>
              </div>

              {link?.openGraph && (
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
