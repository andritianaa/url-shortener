import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Shield, QrCode, FileText, Clock, Globe, Lock, Zap } from "lucide-react"

const features = [
  {
    icon: BarChart3,
    title: "Statistiques avancées",
    description: "Suivez les clics, la géolocalisation, les appareils et plus encore avec des graphiques détaillés.",
  },
  {
    icon: Shield,
    title: "Protection par mot de passe",
    description: "Sécurisez vos liens avec des mots de passe pour contrôler l'accès.",
  },
  {
    icon: QrCode,
    title: "QR Codes automatiques",
    description: "Générez automatiquement des QR codes pour tous vos liens raccourcis.",
  },
  {
    icon: FileText,
    title: "Partage de fichiers",
    description: "Partagez des fichiers directement via des liens courts avec suivi des téléchargements.",
  },
  {
    icon: Clock,
    title: "Expiration programmée",
    description: "Définissez des dates d'expiration ou des limites de clics pour vos liens.",
  },
  {
    icon: Globe,
    title: "Géolocalisation",
    description: "Analysez d'où viennent vos visiteurs avec des données géographiques précises.",
  },
  {
    icon: Lock,
    title: "Liens privés",
    description: "Créez des liens privés visibles uniquement dans votre dashboard.",
  },
  {
    icon: Zap,
    title: "API complète",
    description: "Intégrez notre service dans vos applications avec notre API REST.",
  },
]

export function FeatureSection() {
  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Fonctionnalités puissantes</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Découvrez tous les outils dont vous avez besoin pour gérer vos liens efficacement
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <feature.icon className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
