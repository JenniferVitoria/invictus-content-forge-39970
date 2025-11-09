import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Coins, Loader2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PurchaseInvCoinsProps {
  currentBalance: number;
  onPurchaseComplete: () => void;
}

const PurchaseInvCoins = ({ currentBalance, onPurchaseComplete }: PurchaseInvCoinsProps) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    const purchaseAmount = parseInt(amount);
    
    if (!purchaseAmount || purchaseAmount < 1) {
      toast.error("Insira uma quantidade válida");
      return;
    }

    if (purchaseAmount > 10000) {
      toast.error("Quantidade máxima: 10.000 InvCoins");
      return;
    }

    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Atualizar saldo
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({ invi_coins: currentBalance + purchaseAmount })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      // Registrar transação
      const { error: transactionError } = await supabase
        .from("invcoin_transactions")
        .insert({
          user_id: user.id,
          amount: purchaseAmount,
          type: "purchase",
          description: `Compra de ${purchaseAmount} InvCoins (R$ ${purchaseAmount.toFixed(2)})`
        });

      if (transactionError) throw transactionError;

      toast.success(`${purchaseAmount} InvCoins adicionados com sucesso!`);
      setAmount("");
      setOpen(false);
      onPurchaseComplete();
    } catch (error: any) {
      console.error("Erro ao comprar InvCoins:", error);
      toast.error("Erro ao processar compra");
    } finally {
      setLoading(false);
    }
  };

  const totalValue = parseInt(amount) || 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="lg" 
          className="bg-gradient-to-r from-primary via-accent to-secondary hover:opacity-90 shadow-glow text-white font-bold group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          <ShoppingCart className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
          Comprar InvCoins
        </Button>
      </DialogTrigger>
      
      <DialogContent className="glass-effect sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-glow">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Comprar InvCoins</DialogTitle>
              <DialogDescription>
                1 InvCoin = R$ 1,00
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="glass-effect p-4 rounded-xl border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Saldo atual</span>
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-primary" />
                <span className="font-bold text-lg">{currentBalance}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Quantidade de InvCoins</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              max="10000"
              placeholder="Digite a quantidade"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg"
            />
            <p className="text-xs text-muted-foreground">
              Mínimo: 1 InvCoin | Máximo: 10.000 InvCoins
            </p>
          </div>

          {totalValue > 0 && (
            <div className="glass-effect p-4 rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Valor total</span>
                  <span className="text-2xl font-bold text-gradient-primary">
                    R$ {totalValue.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Novo saldo</span>
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-primary" />
                    <span className="font-bold">{currentBalance + totalValue}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handlePurchase}
            disabled={loading || !totalValue}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-glow text-white"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5 mr-2" />
                Confirmar Compra
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseInvCoins;