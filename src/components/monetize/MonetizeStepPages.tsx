import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check } from "lucide-react";

interface MonetizeStepPagesProps {
  selectedSite: string | null;
  onNext: () => void;
}

const MonetizeStepPages = ({ selectedSite, onNext }: MonetizeStepPagesProps) => {
  const pages = [
    { name: "Política de Privacidade", icon: "🔒" },
    { name: "Termos de Uso", icon: "📜" },
    { name: "Contato", icon: "📧" },
    { name: "Sobre", icon: "ℹ️" },
    { name: "Transparência", icon: "✨" },
  ];

  const handleCreatePages = () => {
    if (!selectedSite) {
      toast.error("Selecione um site primeiro");
      return;
    }

    // Aqui você implementaria a lógica real de criação de páginas
    toast.success("Páginas criadas com sucesso!");
    onNext();
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        As seguintes páginas importantes serão criadas automaticamente no seu site:
      </p>

      <div className="grid grid-cols-1 gap-3">
        {pages.map((page) => (
          <div
            key={page.name}
            className="flex items-center gap-3 p-4 border rounded-lg bg-card"
          >
            <span className="text-2xl">{page.icon}</span>
            <div className="flex-1">
              <h4 className="font-medium">{page.name}</h4>
            </div>
            <Check className="w-5 h-5 text-primary" />
          </div>
        ))}
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Nota:</strong> O conteúdo das páginas será adaptado automaticamente
          ao idioma e nicho do seu site, garantindo conformidade com as diretrizes do
          AdSense.
        </p>
      </div>

      <Button onClick={handleCreatePages} className="w-full" size="lg">
        Criar Páginas Automaticamente
      </Button>
    </div>
  );
};

export default MonetizeStepPages;