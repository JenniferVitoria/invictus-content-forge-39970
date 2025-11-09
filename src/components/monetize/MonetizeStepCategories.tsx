import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MonetizeStepCategoriesProps {
  selectedSite: string | null;
  setSelectedSite: (site: string) => void;
  sites: any[];
  onNext: () => void;
}

const MonetizeStepCategories = ({
  selectedSite,
  setSelectedSite,
  sites,
  onNext,
}: MonetizeStepCategoriesProps) => {
  const [niche, setNiche] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestedCategories, setSuggestedCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([""]);

  const handleSuggestCategories = async () => {
    if (!niche) {
      toast.error("Digite o nicho do site");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("suggest-categories", {
        body: { niche, language: "pt" },
      });

      if (error) throw error;

      setSuggestedCategories(data.categories || []);
      toast.success("Categorias sugeridas com sucesso!");
    } catch (error: any) {
      console.error("Erro ao sugerir categorias:", error);
      toast.error(error.message || "Erro ao sugerir categorias");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategories = async () => {
    if (!selectedSite) {
      toast.error("Selecione um site");
      return;
    }

    const categoriesToCreate = [
      ...suggestedCategories.filter((cat) => selectedCategories.includes(cat.slug)),
      ...customCategories.filter((cat) => cat.trim() !== "").map((cat) => ({
        name: cat,
        slug: cat.toLowerCase().replace(/\s+/g, "-"),
        description: ""
      }))
    ];

    if (categoriesToCreate.length === 0) {
      toast.error("Selecione pelo menos uma categoria");
      return;
    }

    setLoading(true);
    try {
      const insertPromises = categoriesToCreate.map((cat) =>
        supabase.from("site_categories").insert({
          site_id: selectedSite,
          category_name: cat.name,
          category_slug: cat.slug,
        })
      );

      await Promise.all(insertPromises);

      toast.success(`${categoriesToCreate.length} categorias criadas com sucesso!`);
      onNext();
    } catch (error: any) {
      console.error("Erro ao criar categorias:", error);
      toast.error("Erro ao criar categorias");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Selecione o Site</Label>
          <Select value={selectedSite || ""} onValueChange={setSelectedSite}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha um site" />
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

        <div className="space-y-2">
          <Label htmlFor="niche">Nicho do Site</Label>
          <div className="flex gap-2">
            <Input
              id="niche"
              placeholder="Ex: Tecnologia, Saúde, Finanças..."
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
            />
            <Button
              onClick={handleSuggestCategories}
              disabled={loading || !niche}
              variant="secondary"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Sugerir
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {suggestedCategories.length > 0 && (
        <div className="space-y-3">
          <Label>Categorias Sugeridas (selecione)</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestedCategories.map((category) => (
              <div
                key={category.slug}
                className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  id={category.slug}
                  checked={selectedCategories.includes(category.slug)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedCategories([...selectedCategories, category.slug]);
                    } else {
                      setSelectedCategories(
                        selectedCategories.filter((s) => s !== category.slug)
                      );
                    }
                  }}
                />
                <div className="flex-1">
                  <label
                    htmlFor={category.slug}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {category.name}
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {category.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <Label>Ou Digite Categorias Personalizadas</Label>
        {customCategories.map((cat, index) => (
          <Input
            key={index}
            placeholder="Nome da categoria"
            value={cat}
            onChange={(e) => {
              const newCategories = [...customCategories];
              newCategories[index] = e.target.value;
              setCustomCategories(newCategories);
            }}
          />
        ))}
        <Button
          variant="outline"
          onClick={() => setCustomCategories([...customCategories, ""])}
          className="w-full"
        >
          + Adicionar Categoria
        </Button>
      </div>

      <Button
        onClick={handleCreateCategories}
        disabled={loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Criando...
          </>
        ) : (
          "Criar Categorias no Site"
        )}
      </Button>
    </div>
  );
};

export default MonetizeStepCategories;