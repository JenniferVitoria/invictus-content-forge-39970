import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface MonetizeStepPermalinksProps {
  onNext: () => void;
}

const MonetizeStepPermalinks = ({ onNext }: MonetizeStepPermalinksProps) => {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Configure os links permanentes do seu site para melhorar o SEO.
      </p>

      <Card className="border-2 border-primary/20">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">🔗 Passo a Passo:</h4>
            
            <ol className="space-y-3 list-decimal list-inside">
              <li className="text-sm">
                Acesse o painel do WordPress
              </li>
              <li className="text-sm">
                Vá em <strong>Configurações → Links Permanentes</strong>
              </li>
              <li className="text-sm">
                Selecione a opção <strong>"Nome do Post"</strong>
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
          <strong>Por que isso importa?</strong> URLs amigáveis (como
          "/nome-do-artigo") são melhores para SEO do que URLs numéricas (como
          "/?p=123").
        </p>
      </div>

      <Button onClick={onNext} className="w-full" size="lg">
        Concluído - Próxima Etapa
      </Button>
    </div>
  );
};

export default MonetizeStepPermalinks;