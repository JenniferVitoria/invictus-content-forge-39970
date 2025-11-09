import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { History, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("invcoin_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "spend":
        return <TrendingDown className="w-4 h-4 text-orange-500" />;
      case "refund":
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      default:
        return <History className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "purchase":
        return "text-green-500";
      case "spend":
        return "text-orange-500";
      case "refund":
        return "text-blue-500";
      default:
        return "text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <Card className="glass-effect border-2 border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect hover-lift border-2 border-border/50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
      
      <CardHeader className="border-b border-border/50 bg-gradient-card">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-display flex items-center gap-3">
              <History className="w-6 h-6 text-primary" />
              Histórico de Transações
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Últimas 10 movimentações de InvCoins
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-primary/50" />
            </div>
            <p className="text-muted-foreground">Nenhuma transação ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="glass-effect p-4 rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-gradient-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(transaction.created_at), "dd MMM yyyy, HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <div className={`font-bold text-lg ${getTransactionColor(transaction.type)}`}>
                    {transaction.type === "spend" ? "-" : "+"}
                    {transaction.amount}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;