import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Globe, FileText, DollarSign, Sparkles, Check, ArrowRight, Cpu, Rocket, TrendingUp } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: FileText,
      title: "Artigos com IA",
      description: "Claude Sonnet 4 cria artigos completos de 2000+ palavras otimizados para SEO",
      gradient: "from-primary to-accent",
    },
    {
      icon: Sparkles,
      title: "Imagens Automáticas",
      description: "Google Gemini gera imagens profissionais para cada artigo",
      gradient: "from-secondary to-primary",
    },
    {
      icon: Globe,
      title: "WordPress Integrado",
      description: "Publique automaticamente em seus sites WordPress",
      gradient: "from-accent to-secondary",
    },
    {
      icon: DollarSign,
      title: "Otimizado AdSense",
      description: "Prepare seu site para monetização em poucos cliques",
      gradient: "from-primary to-secondary",
    },
  ];

  const plans = [
    {
      name: "Start",
      price: "R$ 39",
      period: "/mês",
      coins: 20,
      features: [
        "20 InviCoins/mês",
        "1 imagem por post",
        "Artigos de 2.800 palavras",
        "SEO básico",
      ],
      highlight: false,
    },
    {
      name: "Pro",
      price: "R$ 89",
      period: "/mês",
      coins: 60,
      features: [
        "60 InviCoins/mês",
        "3 imagens por post",
        "Suporte multiidioma",
        "SEO avançado (85+ score)",
      ],
      highlight: true,
    },
    {
      name: "Premium",
      price: "R$ 199",
      period: "/mês",
      coins: 150,
      features: [
        "150 InviCoins/mês",
        "API WordPress completa",
        "Agendamento automático",
        "Relatórios mensais",
      ],
      highlight: false,
    },
  ];

  const stats = [
    { icon: Rocket, value: "10K+", label: "Posts Criados" },
    { icon: TrendingUp, value: "98%", label: "Taxa de Sucesso" },
    { icon: Cpu, value: "24/7", label: "Disponibilidade" },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Gradient Mesh Background */}
      <div className="fixed inset-0 bg-gradient-mesh opacity-50 pointer-events-none" />
      
      {/* Header */}
      <nav className="glass-effect sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow animate-pulse-glow">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-display font-bold text-gradient">
                Invictus Automatik
              </h1>
            </div>
            <div className="flex gap-3 items-center animate-fade-in">
              <ThemeToggle />
              <Button
                variant="ghost"
                onClick={() => navigate("/auth")}
                className="hover:text-primary transition-all duration-300"
              >
                Login
              </Button>
              <Button
                onClick={() => navigate("/auth")}
                className="bg-gradient-secondary hover:opacity-90 text-white shadow-button hover-lift"
              >
                Criar Conta
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32 relative">
        <div className="max-w-5xl mx-auto">
          {/* Main Content */}
          <div className="text-center space-y-8 animate-fade-in-up">
            <Badge className="bg-gradient-primary/10 text-primary border-primary/20 px-6 py-2.5 text-sm font-medium shadow-glow-accent inline-flex items-center gap-2 hover-lift">
              <Sparkles className="w-4 h-4" />
              Plataforma 100% Automatizada com IA
            </Badge>
            
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold leading-[1.1] tracking-tight">
                <span className="block text-foreground mb-2">
                  Monetize o seu site no
                </span>
                <span className="relative inline-block">
                  <span className="text-gradient bg-gradient-primary bg-clip-text text-transparent animate-gradient">
                    AdSense hoje mesmo!
                  </span>
                  <div className="absolute -inset-2 bg-gradient-primary/10 blur-2xl -z-10 animate-pulse-glow" />
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground leading-relaxed max-w-3xl mx-auto font-light">
                Crie posts completos com IA em segundos. Artigos profissionais, imagens automáticas e SEO otimizado.
              </p>
            </div>

            <div className="flex gap-4 justify-center flex-wrap pt-4">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="bg-gradient-primary hover:opacity-90 shadow-glow-accent text-lg px-12 py-7 hover-lift group relative overflow-hidden rounded-2xl"
              >
                <span className="relative z-10 flex items-center font-semibold">
                  Começar Gratuitamente
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 hover:bg-accent/5 text-lg px-12 py-7 hover-lift rounded-2xl"
              >
                Ver Demonstração
              </Button>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse pointer-events-none" />
          <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-mesh opacity-20 blur-3xl pointer-events-none" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-24 animate-fade-in">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="glass-effect hover-lift border-border/50 backdrop-blur-xl">
                <CardContent className="pt-8 pb-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 bg-gradient-primary/10 rounded-2xl flex items-center justify-center">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="text-4xl font-display font-bold text-gradient-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16 animate-fade-in">
          <Badge className="mb-4 bg-secondary/10 text-secondary border-secondary/30">
            Recursos Avançados
          </Badge>
          <h2 className="text-5xl font-display font-bold mb-4 text-gradient">
            Recursos Poderosos
          </h2>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Tudo que você precisa para criar conteúdo de qualidade
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="glass-effect hover-lift group relative overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <CardHeader className="relative">
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-glow group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-display">{feature.title}</CardTitle>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16 animate-fade-in">
          <Badge className="mb-4 bg-accent/10 text-accent border-accent/30">
            Planos Flexíveis
          </Badge>
          <h2 className="text-5xl font-display font-bold mb-4 text-gradient">
            Planos e Preços
          </h2>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Escolha o plano ideal para suas necessidades
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative hover-lift ${
                plan.highlight
                  ? "gradient-border shadow-glow scale-105"
                  : "glass-effect"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-accent text-white px-6 py-1 shadow-glow-accent animate-pulse-glow">
                    ⭐ Mais Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="pt-8">
                <CardTitle className="text-2xl font-display">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-2 mt-6">
                  <span className="text-5xl font-display font-bold text-gradient-primary">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground text-lg">{plan.period}</span>
                </div>
                <p className="text-muted-foreground mt-3 text-lg">
                  {plan.coins} InviCoins inclusos
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full py-6 text-lg ${
                    plan.highlight
                      ? "bg-gradient-primary hover:opacity-90 shadow-button"
                      : "bg-gradient-secondary hover:opacity-90 text-white"
                  } hover-lift`}
                  onClick={() => navigate("/auth")}
                >
                  Começar Agora
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24 text-center animate-fade-in">
        <div className="relative bg-gradient-hero rounded-3xl p-16 shadow-glow overflow-hidden animate-gradient">
          <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
          <div className="relative z-10">
            <h2 className="text-5xl font-display font-bold text-white mb-6">
              Pronto para Começar?
            </h2>
            <p className="text-white/90 text-xl mb-10 max-w-3xl mx-auto leading-relaxed">
              Junte-se a centenas de criadores de conteúdo que já automatizaram seus sites WordPress
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-white text-primary hover:bg-white/95 text-lg px-12 py-6 shadow-card hover-lift group"
            >
              Criar Conta Gratuitamente
              <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 glass-effect mt-20">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="font-display font-semibold text-lg">Invictus Automatik</span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors hover:text-primary">
                Termos de Uso
              </a>
              <a href="#" className="hover:text-foreground transition-colors hover:text-primary">
                Política de Privacidade
              </a>
              <a href="#" className="hover:text-foreground transition-colors hover:text-primary">
                Contato
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
