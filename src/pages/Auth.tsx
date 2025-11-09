import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Zap, ArrowLeft, Sparkles, Shield, Rocket } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import EmailVerification from "@/components/EmailVerification";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) {
      toast.error("Por favor, insira seu nome");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        setPendingUserId(data.user.id);
        setShowVerification(true);
        
        // Enviar código de verificação
        const { error: sendError } = await supabase.functions.invoke("send-verification-code", {
          body: { email, userId: data.user.id },
        });

        if (sendError) {
          console.error("Erro ao enviar código:", sendError);
          toast.warning("Conta criada, mas houve um problema ao enviar o código de verificação");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  const handleVerified = () => {
    toast.success("Email verificado com sucesso! Você pode fazer login agora.");
    setShowVerification(false);
    setPendingUserId(null);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setDisplayName("");
  };

  const benefits = [
    { icon: Sparkles, text: "IA de última geração" },
    { icon: Shield, text: "Dados protegidos" },
    { icon: Rocket, text: "Deploy instantâneo" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
      {/* Gradient Mesh Background */}
      <div className="fixed inset-0 bg-gradient-mesh opacity-50 pointer-events-none" />
      
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col justify-center p-12 animate-fade-in">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow animate-pulse-glow">
                <Zap className="w-9 h-9 text-white" />
              </div>
              <h1 className="text-4xl font-display font-bold text-gradient">
                Invictus Automatik
              </h1>
            </div>
            <p className="text-2xl text-muted-foreground mb-8 leading-relaxed">
              Transforme seu WordPress em uma máquina de conteúdo automatizada
            </p>
          </div>

          <div className="space-y-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-4 group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl text-foreground">{benefit.text}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-12 p-8 glass-effect rounded-2xl hover-lift">
            <p className="text-muted-foreground italic">
              "Economizei mais de 20 horas por semana com a automação. Incrível!"
            </p>
            <p className="text-foreground font-semibold mt-4">— Cliente Satisfeito</p>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full max-w-md mx-auto animate-scale-in">
          {showVerification && pendingUserId ? (
            <EmailVerification
              email={email}
              userId={pendingUserId}
              onVerified={handleVerified}
            />
          ) : (
            <>
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-flex items-center justify-center gap-2 mb-4">
              <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow animate-pulse-glow">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-display font-bold text-gradient">
                Invictus Automatik
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Automação profissional para WordPress
            </p>
          </div>

          <Card className="shadow-card-hover glass-effect border-2 border-border/50 hover:border-primary/30 transition-all duration-300">
            <Tabs defaultValue="login" className="w-full">
              <CardHeader>
                <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                  <TabsTrigger 
                    value="login"
                    className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup"
                    className="data-[state=active]:bg-gradient-secondary data-[state=active]:text-white"
                  >
                    Criar Conta
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <TabsContent value="login">
                <form onSubmit={handleLogin}>
                  <CardContent className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email-login" className="text-base">Email</Label>
                      <Input
                        id="email-login"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 text-base border-border/50 focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-login" className="text-base">Senha</Label>
                      <Input
                        id="password-login"
                        type="password"
                        placeholder="••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 text-base border-border/50 focus:border-primary transition-colors"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-primary hover:opacity-90 shadow-button text-base hover-lift"
                      disabled={loading}
                    >
                      {loading ? "Entrando..." : "Entrar"}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup}>
                  <CardContent className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="displayName" className="text-base">Nome de Usuário</Label>
                      <Input
                        id="displayName"
                        type="text"
                        placeholder="Seu nome"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                        className="h-12 text-base border-border/50 focus:border-secondary transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-signup" className="text-base">Email</Label>
                      <Input
                        id="email-signup"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 text-base border-border/50 focus:border-secondary transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-signup" className="text-base">Senha</Label>
                      <Input
                        id="password-signup"
                        type="password"
                        placeholder="••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 text-base border-border/50 focus:border-secondary transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-base">Confirmar Senha</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="h-12 text-base border-border/50 focus:border-secondary transition-colors"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-secondary hover:opacity-90 text-white shadow-button text-base hover-lift"
                      disabled={loading}
                    >
                      {loading ? "Criando..." : "Criar Conta"}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
            </Tabs>
          </Card>

          <div className="mt-8 text-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-foreground hover:text-primary transition-all group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Voltar para Home
            </Button>
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
