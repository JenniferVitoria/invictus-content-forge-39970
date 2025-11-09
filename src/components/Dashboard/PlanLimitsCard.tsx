import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Crown, FileText, Globe, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePlanLimits } from "@/hooks/usePlanLimits";

interface PlanLimitsCardProps {
  userId: string;
}

const PlanLimitsCard = ({ userId }: PlanLimitsCardProps) => {
  const navigate = useNavigate();
  const { data: planLimits, isLoading } = usePlanLimits(userId);

  if (isLoading || !planLimits) {
    return null;
  }

  const { plan, currentCoins, articlesThisMonth, connectedSites } = planLimits;

  const articleProgress = (articlesThisMonth / plan.max_articles_per_month) * 100;
  const siteProgress = (connectedSites / plan.max_sites) * 100;

  return (
    <Card className="glass-effect hover-lift border-2 border-border/50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
      
      <CardHeader className="border-b border-border/50 bg-gradient-card">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-display flex items-center gap-3">
              <Crown className="w-6 h-6 text-primary" />
              Limites do Plano {plan.display_name}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Uso mensal dos recursos do seu plano
            </CardDescription>
          </div>
          <Button
            onClick={() => navigate("/plans")}
            variant="outline"
            className="bg-gradient-primary hover:opacity-90 text-white border-0"
          >
            Fazer Upgrade
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-medium">Artigos este mês</span>
            </div>
            <span className="text-sm font-semibold">
              {articlesThisMonth} / {plan.max_articles_per_month}
            </span>
          </div>
          <Progress value={articleProgress} className="h-2" />
          {articleProgress >= 80 && (
            <p className="text-xs text-warning">
              Você está próximo do limite de artigos!
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              <span className="font-medium">Sites conectados</span>
            </div>
            <span className="text-sm font-semibold">
              {connectedSites} / {plan.max_sites}
            </span>
          </div>
          <Progress value={siteProgress} className="h-2" />
          {siteProgress >= 80 && (
            <p className="text-xs text-warning">
              Você está próximo do limite de sites!
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-primary" />
              <span className="font-medium">InviCoins mensais</span>
            </div>
            <span className="text-sm font-semibold">
              {plan.monthly_invicoins} coins/mês
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Saldo atual: {currentCoins} InviCoins
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanLimitsCard;
