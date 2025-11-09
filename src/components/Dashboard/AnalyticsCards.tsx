import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Globe, Coins, TrendingUp } from "lucide-react";

interface AnalyticsCardsProps {
  totalArticles: number;
  totalSites: number;
  coinsSpent: number;
  currentBalance: number;
}

const AnalyticsCards = ({ totalArticles, totalSites, coinsSpent, currentBalance }: AnalyticsCardsProps) => {
  const stats = [
    {
      title: "Artigos Gerados",
      value: totalArticles,
      icon: FileText,
      description: "Total de posts criados",
      gradient: "from-primary to-accent",
      glow: "shadow-glow"
    },
    {
      title: "Sites Conectados",
      value: totalSites,
      icon: Globe,
      description: "WordPress integrados",
      gradient: "from-secondary to-primary",
      glow: "shadow-glow-secondary"
    },
    {
      title: "InvCoins Gastos",
      value: coinsSpent,
      icon: TrendingUp,
      description: "Total utilizado",
      gradient: "from-accent to-secondary",
      glow: "shadow-glow-accent"
    },
    {
      title: "Saldo Atual",
      value: currentBalance,
      icon: Coins,
      description: "InvCoins disponíveis",
      gradient: "from-primary via-accent to-secondary",
      glow: "shadow-glow"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="glass-effect hover-lift group relative overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-all duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            
            <CardHeader className="relative pb-3">
              <div className="flex items-start justify-between">
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center ${stat.glow} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="w-3 h-3 bg-secondary rounded-full animate-pulse shadow-glow-secondary" />
              </div>
            </CardHeader>
            
            <CardContent className="relative">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.title}
                </p>
                <p className="text-4xl font-display font-bold text-gradient-primary">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AnalyticsCards;