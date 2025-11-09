import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface MonetizeStepPluginsProps {
  onNext: () => void;
}

const plugins = [
  {
    name: "Ad Inserter",
    description: "Gerenciamento avançado de anúncios",
    icon: "📢",
  },
  {
    name: "LiteSpeed Cache",
    description: "Otimização de velocidade do site",
    icon: "⚡",
  },
  {
    name: "Rank Math SEO",
    description: "Otimização completa de SEO",
    icon: "🎯",
  },
  {
    name: "Instant Indexing",
    description: "Indexação rápida no Google",
    icon: "🚀",
  },
];

const MonetizeStepPlugins = ({ onNext }: MonetizeStepPluginsProps) => {
  const [installedPlugins, setInstalledPlugins] = useState<string[]>([]);

  const handleVerify = () => {
    if (installedPlugins.length < plugins.length) {
      toast.warning("Recomendamos instalar todos os plugins");
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Instale os seguintes plugins no WordPress para otimizar seu site:
      </p>

      <div className="grid grid-cols-1 gap-4">
        {plugins.map((plugin) => (
          <div
            key={plugin.name}
            className="flex items-start gap-4 p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
          >
            <span className="text-3xl">{plugin.icon}</span>
            <div className="flex-1">
              <h4 className="font-semibold">{plugin.name}</h4>
              <p className="text-sm text-muted-foreground">{plugin.description}</p>
            </div>
            <Checkbox
              checked={installedPlugins.includes(plugin.name)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setInstalledPlugins([...installedPlugins, plugin.name]);
                } else {
                  setInstalledPlugins(
                    installedPlugins.filter((p) => p !== plugin.name)
                  );
                }
              }}
            />
          </div>
        ))}
      </div>

      <div className="bg-muted/50 p-4 rounded-lg space-y-2">
        <h4 className="font-semibold text-sm">📝 Como instalar:</h4>
        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Vá em <strong>Plugins → Adicionar Novo</strong></li>
          <li>Pesquise pelo nome do plugin</li>
          <li>Clique em <strong>Instalar Agora</strong></li>
          <li>Após a instalação, clique em <strong>Ativar</strong></li>
          <li>Marque a caixa acima após instalar cada plugin</li>
        </ol>
      </div>

      <Button onClick={handleVerify} className="w-full" size="lg">
        Verificar e Concluir
      </Button>
    </div>
  );
};

export default MonetizeStepPlugins;