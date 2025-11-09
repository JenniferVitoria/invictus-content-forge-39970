import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Sparkles, FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const CreateArticles = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [sites, setSites] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [niche, setNiche] = useState("");
  const [language, setLanguage] = useState("pt");
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [selectedTitles, setSelectedTitles] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadSites();
  }, []);

  useEffect(() => {
    if (selectedSite) {
      loadCategories();
    }
  }, [selectedSite]);

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
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("site_categories")
        .select("*")
        .eq("site_id", selectedSite);

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      toast.error("Erro ao carregar categorias");
    }
  };

  const handleGenerateTitles = async () => {
    if (!selectedCategory) {
      toast.error("Selecione uma categoria");
      return;
    }

    const category = categories.find((c) => c.id === selectedCategory);
    if (!category) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-titles", {
        body: {
          category: category.category_name,
          niche: niche || undefined,
          language,
        },
      });

      if (error) throw error;

      setGeneratedTitles(data.titles || []);
      toast.success("Títulos gerados com sucesso!");
      setStep(2);
    } catch (error: any) {
      console.error("Erro ao gerar títulos:", error);
      toast.error(error.message || "Erro ao gerar títulos");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateArticles = async () => {
    if (selectedTitles.length === 0) {
      toast.error("Selecione pelo menos um título");
      return;
    }

    setLoading(true);
    setStep(3);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const totalArticles = selectedTitles.length;
      let completed = 0;

      for (const title of selectedTitles) {
        try {
          // Gera o conteúdo do artigo
          const { data: articleData, error: articleError } = await supabase.functions.invoke(
            "generate-article",
            {
              body: {
                title,
                keyword: title.split(" ").slice(0, 3).join(" "), // Usa primeiras palavras como keyword
                language,
              },
            }
          );

          if (articleError) throw articleError;

          // Salva o artigo no banco
          const { data: savedArticle, error: saveError } = await supabase
            .from("articles")
            .insert({
              user_id: user.id,
              site_id: selectedSite,
              category_id: selectedCategory,
              title,
              content: articleData.content,
              status: "draft",
              language,
            })
            .select()
            .single();

          if (saveError) throw saveError;

          // Gera 3 imagens para o artigo
          // (Simplificado - você pode extrair subtítulos do HTML para imagens mais contextuais)
          for (let i = 0; i < 3; i++) {
            try {
              const { data: imageData, error: imageError } = await supabase.functions.invoke(
                "generate-image",
                {
                  body: {
                    prompt: `${title} - parte ${i + 1}`,
                    subtitle: `Imagem ilustrativa ${i + 1}`,
                  },
                }
              );

              if (!imageError && imageData?.imageUrl) {
                await supabase.from("article_images").insert({
                  article_id: savedArticle.id,
                  image_url: imageData.imageUrl,
                  subtitle: `Imagem ilustrativa ${i + 1}`,
                  position: i + 1,
                });
              }
            } catch (imgError) {
              console.error("Erro ao gerar imagem:", imgError);
              // Continua mesmo se uma imagem falhar
            }
          }

          completed++;
          setProgress(Math.round((completed / totalArticles) * 100));
          toast.success(`Artigo criado: ${title}`);
        } catch (error) {
          console.error(`Erro ao criar artigo "${title}":`, error);
          toast.error(`Erro ao criar: ${title}`);
        }
      }

      toast.success("Todos os artigos foram processados!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Erro ao gerar artigos:", error);
      toast.error(error.message || "Erro ao gerar artigos");
    } finally {
      setLoading(false);
    }
  };

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
                Você precisa conectar um site WordPress antes de criar artigos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/connect-site")}>Conectar Site</Button>
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

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl">Criar Artigos AdSense</CardTitle>
                <CardDescription>
                  Gere artigos otimizados automaticamente com IA
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Site WordPress</Label>
                    <Select value={selectedSite || ""} onValueChange={setSelectedSite}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o site" />
                      </SelectTrigger>
                      <SelectContent>
                        {sites.map((site) => (
                          <SelectItem key={site.id} value={site.id}>
                            {site.site_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedSite && categories.length === 0 && (
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Este site não possui categorias. Configure as categorias primeiro na
                        seção de monetização.
                      </p>
                    </div>
                  )}

                  {selectedSite && categories.length > 0 && (
                    <>
                      <div className="space-y-2">
                        <Label>Categoria</Label>
                        <Select value={selectedCategory || ""} onValueChange={setSelectedCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.category_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="niche">Nicho (opcional)</Label>
                        <Input
                          id="niche"
                          placeholder="Especifique o nicho para títulos mais direcionados"
                          value={niche}
                          onChange={(e) => setNiche(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Idioma</Label>
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pt">Português</SelectItem>
                            <SelectItem value="en">Inglês</SelectItem>
                            <SelectItem value="es">Espanhol</SelectItem>
                            <SelectItem value="it">Italiano</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        onClick={handleGenerateTitles}
                        disabled={loading || !selectedCategory}
                        className="w-full"
                        size="lg"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Gerando títulos...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Gerar 10 Títulos
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Selecione os Títulos</h3>
                  <p className="text-sm text-muted-foreground">
                    Escolha quais artigos você deseja criar. Cada artigo terá ~2500 palavras e 3
                    imagens.
                  </p>

                  <div className="space-y-2">
                    {generatedTitles.map((title, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          id={`title-${index}`}
                          checked={selectedTitles.includes(title)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTitles([...selectedTitles, title]);
                            } else {
                              setSelectedTitles(selectedTitles.filter((t) => t !== title));
                            }
                          }}
                        />
                        <label
                          htmlFor={`title-${index}`}
                          className="text-sm font-medium cursor-pointer flex-1"
                        >
                          {title}
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Voltar
                    </Button>
                    <Button
                      onClick={handleGenerateArticles}
                      disabled={selectedTitles.length === 0}
                      className="flex-1"
                    >
                      Gerar {selectedTitles.length} Artigo(s)
                    </Button>
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-6 py-8">
                  <div className="text-center space-y-2">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                    <h3 className="text-lg font-semibold">Gerando Artigos...</h3>
                    <p className="text-sm text-muted-foreground">
                      Isso pode levar alguns minutos. Cada artigo está sendo criado com conteúdo
                      otimizado e 3 imagens exclusivas.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">
                      Por favor, não feche esta página até que todos os artigos sejam gerados.
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateArticles;