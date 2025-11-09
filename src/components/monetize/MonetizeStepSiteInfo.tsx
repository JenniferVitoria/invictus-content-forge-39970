import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface MonetizeStepSiteInfoProps {
  onNext: () => void;
}

const MonetizeStepSiteInfo = ({ onNext }: MonetizeStepSiteInfoProps) => {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Para esta etapa, você precisa configurar o nome e subtítulo do site manualmente
        no WordPress.
      </p>

      <Card className="border-2 border-primary/20">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">📝 Passo a Passo:</h4>
            
            <ol className="space-y-3 list-decimal list-inside">
              <li className="text-sm">
                Acesse o painel do WordPress
              </li>
              <li className="text-sm">
                Vá em <strong>Configurações → Geral</strong>
              </li>
              <li className="text-sm">
                Altere o <strong>Título do Site</strong> para um nome relevante ao seu
                nicho
              </li>
              <li className="text-sm">
                Altere o <strong>Subtítulo</strong> para uma descrição curta e otimizada
              </li>
              <li className="text-sm">
                Clique em <strong>Salvar Alterações</strong>
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Dica:</strong> Use palavras-chave relevantes no título e subtítulo
          para melhorar o SEO do seu site.
        </p>
      </div>

      <Button onClick={onNext} className="w-full" size="lg">
        Concluído - Próxima Etapa
      </Button>
    </div>
  );
};

export default MonetizeStepSiteInfo;