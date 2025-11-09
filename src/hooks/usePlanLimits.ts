import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PlanType {
  id: string;
  name: string;
  display_name: string;
  monthly_invicoins: number;
  max_articles_per_month: number;
  max_sites: number;
  features: string[];
  price_monthly: number;
}

export const usePlanLimits = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["planLimits", userId],
    queryFn: async () => {
      if (!userId) return null;

      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("plan_type, invi_coins")
        .eq("user_id", userId)
        .single();

      if (profileError) throw profileError;

      // Buscar detalhes do plano
      const { data: planData, error: planError } = await supabase
        .from("plan_types")
        .select("*")
        .eq("name", profile.plan_type)
        .single();

      if (planError) throw planError;

      // Contar artigos criados este mês
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: articlesCount } = await supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", startOfMonth.toISOString());

      // Contar sites conectados
      const { count: sitesCount } = await supabase
        .from("wordpress_sites")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      return {
        plan: planData as PlanType,
        currentCoins: profile.invi_coins,
        articlesThisMonth: articlesCount || 0,
        connectedSites: sitesCount || 0,
      };
    },
    enabled: !!userId,
  });
};

export const checkPlanLimit = (
  type: "articles" | "sites" | "coins",
  current: number,
  max: number,
  required: number = 1
): boolean => {
  if (type === "coins") {
    if (current < required) {
      toast.error("Saldo insuficiente de InviCoins!", {
        description: `Você precisa de ${required} InviCoins mas tem apenas ${current}.`,
      });
      return false;
    }
  } else if (type === "articles") {
    if (current >= max) {
      toast.error("Limite de artigos atingido!", {
        description: `Seu plano permite ${max} artigos por mês. Faça upgrade para continuar.`,
      });
      return false;
    }
  } else if (type === "sites") {
    if (current >= max) {
      toast.error("Limite de sites atingido!", {
        description: `Seu plano permite ${max} sites. Faça upgrade para adicionar mais.`,
      });
      return false;
    }
  }
  
  return true;
};
