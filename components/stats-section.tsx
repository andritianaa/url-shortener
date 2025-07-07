import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const stats = [
  {
    value: "10M+",
    label: "Liens créés",
    description: "Liens raccourcis générés par nos utilisateurs",
  },
  {
    value: "500M+",
    label: "Clics trackés",
    description: "Interactions suivies et analysées",
  },
  {
    value: "50K+",
    label: "Utilisateurs actifs",
    description: "Professionnels qui nous font confiance",
  },
  {
    value: "99.9%",
    label: "Uptime",
    description: "Disponibilité garantie de notre service",
  },
]

export function StatsSection() {
  return (
    <section className="py-16 bg-muted/50 rounded-2xl">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Des chiffres qui parlent</h2>
        <p className="text-xl text-muted-foreground">Rejoignez des milliers d'utilisateurs satisfaits</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-primary">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">{stat.label}</h3>
              <p className="text-sm text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
