import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import MonetizeStepCategories from "@/components/monetize/MonetizeStepCategories";
import MonetizeStepPages from "@/components/monetize/MonetizeStepPages";
import MonetizeStepSiteInfo from "@/components/monetize/MonetizeStepSiteInfo";
import MonetizeStepPermalinks from "@/components/monetize/MonetizeStepPermalinks";
import MonetizeStepPlugins from "@/components/monetize/MonetizeStepPlugins";

const steps = [
  { id: "categories", title: "Criar Categorias", component: MonetizeStepCategories },
  { id: "pages", title: "Criar Páginas", component: MonetizeStepPages },
  { id: "site_info", title: "Nome e Subtítulo", component: MonetizeStepSiteInfo },
  { id: "permalinks", title: "Links Permanentes", component: MonetizeStepPermalinks },
  { id: "plugins", title: "Instalar Plugins", component: MonetizeStepPlugins },
];

const Monetize = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [sites, setSites] = useState<any[]>([]);

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("wordpress_sites")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      setSites(data || []);
    } catch (error) {
      console.error("Erro ao carregar sites:", error);
      toast.error("Erro ao carregar sites");
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      toast.success("Configuração de monetização concluída!");
      navigate("/dashboard");
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container max-w-2xl mx-auto py-8">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Card>
            <CardHeader>
              <CardTitle>Nenhum Site Conectado</CardTitle>
              <CardDescription>
                Você precisa conectar um site WordPress antes de configurar a monetização.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/connect-site")}>
                Conectar Site
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container max-w-4xl mx-auto py-8">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">Monetizar com AdSense</CardTitle>
            <CardDescription>
              Prepare seu site para monetização em {steps.length} etapas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      index <= currentStep
                        ? "bg-gradient-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 w-16 mx-2 ${
                        index < currentStep ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">{steps[currentStep].title}</h3>
              <CurrentStepComponent
                selectedSite={selectedSite}
                setSelectedSite={setSelectedSite}
                sites={sites}
                onNext={handleNextStep}
              />
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousStep}
                disabled={currentStep === 0}
              >
                Anterior
              </Button>
              <Button onClick={handleNextStep}>
                {currentStep === steps.length - 1 ? "Concluir" : "Próximo"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Monetize;