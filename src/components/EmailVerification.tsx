import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Check } from "lucide-react";

interface EmailVerificationProps {
  email: string;
  userId: string;
  onVerified: () => void;
}

const EmailVerification = ({ email, userId, onVerified }: EmailVerificationProps) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const sendVerificationCode = async () => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-verification-code", {
        body: { email, userId },
      });

      if (error) throw error;

      toast.success("Código enviado!", {
        description: `Enviamos um código de verificação para ${email}`,
      });

      // Temporário: mostrar código no console para teste
      if (data?.code) {
        console.log("Código de verificação:", data.code);
        toast.info(`Código de teste: ${data.code}`, {
          description: "Este é um código temporário para testes",
        });
      }
    } catch (error: any) {
      toast.error("Erro ao enviar código", {
        description: error.message,
      });
    } finally {
      setSending(false);
    }
  };

  const verifyCode = async () => {
    if (!code || code.length !== 6) {
      toast.error("Código inválido", {
        description: "Digite um código de 6 dígitos",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-email-code", {
        body: { code, userId },
      });

      if (error) throw error;

      toast.success("Email verificado!", {
        description: "Sua conta foi ativada com sucesso!",
      });
      
      onVerified();
    } catch (error: any) {
      toast.error("Código inválido ou expirado", {
        description: "Verifique o código e tente novamente",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-effect border-2 border-border/50">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle>Verificar Email</CardTitle>
            <CardDescription>Digite o código enviado para {email}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code">Código de Verificação</Label>
          <Input
            id="code"
            type="text"
            placeholder="000000"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="h-12 text-center text-2xl tracking-widest"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={verifyCode}
            disabled={loading || code.length !== 6}
            className="flex-1 h-12 bg-gradient-primary hover:opacity-90"
          >
            {loading ? "Verificando..." : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Verificar
              </>
            )}
          </Button>
          <Button
            onClick={sendVerificationCode}
            disabled={sending}
            variant="outline"
            className="h-12"
          >
            {sending ? "Enviando..." : "Reenviar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailVerification;
