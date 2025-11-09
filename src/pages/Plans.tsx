import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Rocket } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Plans = () => {
  const navigate = useNavigate();

  const { data: plans, isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plan_types")
        .select("*")
        .order("price_monthly", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const { data: currentUser } = useQuery({
    queryKey: ["currentUserPlan"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("plan_type")
        .eq("user_id", user.id)
        .single();

      return profile;
    },
  });

  const handleSelectPlan = (planName: string) => {
    if (planName === "start") {
      toast.info("Você já está no plano Start!");
      return;
    }
    
    toast.info("Sistema de pagamento em desenvolvimento", {
      description: "Em breve você poderá fazer upgrade do seu plano!",
    });
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case "start": return Zap;
      case "pro": return Rocket;
      case "premium": return Crown;
      default: return Zap;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando planos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-gradient mb-4">
            Escolha seu Plano
          </h1>
          <p className="text-xl text-muted-foreground">
            Selecione o plano ideal para suas necessidades
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans?.map((plan) => {
            const Icon = getPlanIcon(plan.name);
            const isCurrentPlan = currentUser?.plan_type === plan.name;
            const isPremium = plan.name === "premium";

            return (
              <Card
                key={plan.id}
                className={`relative glass-effect border-2 transition-all hover:scale-105 ${
                  isPremium ? "border-primary shadow-glow" : "border-border/50"
                }`}
              >
                {isPremium && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-primary">
                    Mais Popular
                  </Badge>
                )}
                
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-center">{plan.display_name}</CardTitle>
                  <CardDescription className="text-center">
                    <span className="text-4xl font-bold text-foreground">
                      R$ {plan.price_monthly.toFixed(2)}
                    </span>
                    /mês
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">InviCoins/mês</span>
                      <span className="font-semibold">{plan.monthly_invicoins}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Artigos/mês</span>
                      <span className="font-semibold">{plan.max_articles_per_month}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sites</span>
                      <span className="font-semibold">{plan.max_sites}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    {(plan.features as string[]).map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    onClick={() => handleSelectPlan(plan.name)}
                    disabled={isCurrentPlan}
                    className={`w-full h-12 ${
                      isPremium
                        ? "bg-gradient-primary hover:opacity-90 shadow-button"
                        : "bg-gradient-secondary hover:opacity-90"
                    }`}
                  >
                    {isCurrentPlan ? "Plano Atual" : "Selecionar Plano"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Plans;
