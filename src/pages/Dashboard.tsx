import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Globe, DollarSign, FileText, Palette, LayoutTemplate, Rss, LogOut, Menu, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ThemeToggle from "@/components/ThemeToggle";
import AnalyticsCards from "@/components/Dashboard/AnalyticsCards";
import PurchaseInvCoins from "@/components/Dashboard/PurchaseInvCoins";
import TransactionHistory from "@/components/Dashboard/TransactionHistory";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inviCoins, setInviCoins] = useState(0);
  const [planType, setPlanType] = useState("start");
  const [totalArticles, setTotalArticles] = useState(0);
  const [totalSites, setTotalSites] = useState(0);
  const [coinsSpent, setCoinsSpent] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          fetchUserProfile(session.user.id);
        } else {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("invi_coins, plan_type, display_name, avatar_url")
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      if (data) {
        setInviCoins(data.invi_coins);
        setPlanType(data.plan_type);
        setDisplayName(data.display_name || "");
        setAvatarUrl(data.avatar_url || "");
      }

      // Buscar estatísticas
      await fetchStats(userId);
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
    }
  };

  const fetchStats = async (userId: string) => {
    try {
      // Total de artigos
      const { count: articlesCount } = await supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      setTotalArticles(articlesCount || 0);

      // Total de sites
      const { count: sitesCount } = await supabase
        .from("wordpress_sites")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      setTotalSites(sitesCount || 0);

      // Total de InvCoins gastos
      const { data: spentData } = await supabase
        .from("invcoin_transactions")
        .select("amount")
        .eq("user_id", userId)
        .eq("type", "spend");

      const totalSpent = spentData?.reduce((sum, t) => sum + t.amount, 0) || 0;
      setCoinsSpent(totalSpent);
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
    }
  };

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      } else {
        navigate("/auth");
      }
    } catch (error) {
      console.error("Erro ao verificar usuário:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logout realizado com sucesso!");
      navigate("/");
    } catch (error: any) {
      toast.error("Erro ao fazer logout");
    }
  };

  const features = [
    {
      title: "Conectar Site",
      description: "Vincule seu site WordPress à plataforma",
      icon: Globe,
      action: () => navigate("/connect-site"),
    },
    {
      title: "Monetizar AdSense",
      description: "Prepare seu site para monetização",
      icon: DollarSign,
      action: () => navigate("/monetize"),
    },
    {
      title: "Criar Artigos",
      description: "Gere posts otimizados automaticamente",
      icon: FileText,
      action: () => navigate("/create-articles"),
    },
    {
      title: "Aparência",
      description: "Crie logo e favicon com IA",
      icon: Palette,
      action: () => toast.info("Funcionalidade em desenvolvimento"),
    },
    {
      title: "Temas",
      description: "Escolha temas profissionais",
      icon: LayoutTemplate,
      action: () => toast.info("Funcionalidade em desenvolvimento"),
    },
    {
      title: "Alimentar Site",
      description: "Mantenha conteúdo atualizado",
      icon: Rss,
      action: () => toast.info("Funcionalidade em desenvolvimento"),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const DashboardContent = () => (
    <>
      <div className="relative bg-gradient-hero p-12 rounded-3xl shadow-glow mb-8 overflow-hidden animate-fade-in animate-gradient border border-white/20">
        <div className="absolute inset-0 bg-gradient-mesh opacity-40" />
        
        {/* Decorative Cyber Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-10" style={{ 
          backgroundImage: 'linear-gradient(hsl(0 0% 100% / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
        
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-8">
          <div className="animate-fade-in-up">
            <h2 className="text-5xl font-display font-bold text-white mb-4 flex items-center gap-4">
              <span className="inline-flex items-center gap-3">
                <span className="w-3 h-3 bg-secondary rounded-full animate-pulse shadow-glow-secondary" />
                Seja Bem-vindo, {displayName || user?.email?.split("@")[0]}!
              </span>
            </h2>
            <p className="text-white/90 text-xl font-medium">
              {user?.email}
            </p>
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <span className="text-white/80 text-sm">Plano: <span className="font-bold text-white">{planType.toUpperCase()}</span></span>
              </div>
              <PurchaseInvCoins 
                currentBalance={inviCoins}
                onPurchaseComplete={() => fetchUserProfile(user?.id)}
              />
            </div>
          </div>
          <div className="glass-effect bg-gradient-to-br from-secondary/20 to-primary/20 dark:from-white/10 dark:to-white/10 px-10 py-7 rounded-2xl border-2 border-secondary/40 dark:border-white/30 hover-lift relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-secondary opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            <div className="relative flex items-center gap-5">
              <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center shadow-glow-secondary group-hover:scale-110 transition-transform duration-300">
                <Coins className="w-9 h-9 text-white" />
              </div>
              <div>
                <p className="text-foreground dark:text-white text-sm font-medium uppercase tracking-wider mb-1">Saldo de InviCoins</p>
                <p className="text-5xl font-display font-bold text-gradient-primary dark:text-white">{inviCoins}</p>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-20 h-20 bg-accent/20 rounded-full blur-2xl" />
          </div>
        </div>
      </div>

      <AnalyticsCards 
        totalArticles={totalArticles}
        totalSites={totalSites}
        coinsSpent={coinsSpent}
        currentBalance={inviCoins}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TransactionHistory />
        
        <Card className="glass-effect hover-lift border-2 border-border/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary via-primary to-accent" />
          <CardHeader className="border-b border-border/50 bg-gradient-card">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-display flex items-center gap-3">
                  <FileText className="w-6 h-6 text-primary" />
                  Artigos Recentes
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Seus últimos posts gerados
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {totalArticles === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-primary/50" />
                </div>
                <p className="text-muted-foreground mb-4">Nenhum artigo criado ainda</p>
                <Button 
                  onClick={() => navigate("/create-articles")}
                  className="bg-gradient-primary hover:opacity-90 shadow-button text-white"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Criar Primeiro Artigo
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Lista de artigos em desenvolvimento
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card
              key={index}
              className="glass-effect hover-lift cursor-pointer group relative overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-all duration-300"
              onClick={feature.action}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              
              {/* Cyber Corner Accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-primary opacity-0 group-hover:opacity-20 rounded-bl-full transition-all duration-300" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-secondary opacity-0 group-hover:opacity-20 rounded-tr-full transition-all duration-300" />
              
              <CardHeader className="relative p-6">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-5 shadow-glow group-hover:scale-110 group-hover:shadow-glow-secondary group-hover:rotate-6 transition-all duration-300">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-display group-hover:text-primary transition-colors mb-2">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                
                {/* Status Indicator */}
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-secondary rounded-full animate-pulse shadow-glow-secondary" />
                  <span className="text-xs text-muted-foreground font-medium">DISPONÍVEL</span>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

    </>
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Gradient Mesh Background */}
      <div className="fixed inset-0 bg-gradient-mesh opacity-30 pointer-events-none" />
      
      <nav className="glass-effect sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow animate-pulse-glow">
                <span className="text-white font-bold text-xl">ⓘ</span>
              </div>
              <h1 className="text-xl font-display font-bold text-gradient hidden sm:block">
                Invictus Automatik
              </h1>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              <Button
                variant="ghost"
                onClick={() => navigate("/profile")}
                className="text-muted-foreground hover:text-primary transition-all flex items-center gap-2"
              >
                <Avatar className="w-8 h-8 border-2 border-primary/20">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback className="text-xs bg-gradient-primary text-white">
                    {displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden lg:inline">Perfil</span>
              </Button>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-primary transition-all"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>

            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="glass-effect">
                <div className="flex flex-col gap-4 mt-8">
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/profile")}
                    className="justify-start hover:text-primary"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Perfil
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="justify-start hover:text-primary"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <DashboardContent />
      </main>
    </div>
  );
};

export default Dashboard;
