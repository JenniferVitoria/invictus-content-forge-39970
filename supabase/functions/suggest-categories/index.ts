import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { niche, language = "pt" } = await req.json();
    
    if (!niche) {
      throw new Error("Nicho é obrigatório");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const languageMap: Record<string, string> = {
      pt: "português brasileiro",
      en: "inglês",
      es: "espanhol",
      it: "italiano"
    };

    const prompt = `Você é um especialista em SEO e monetização com AdSense. Sugira as 10 melhores categorias para um site no nicho "${niche}".
    
    Critérios:
    - Categorias com alto volume de busca
    - Relevantes para o nicho
    - Com potencial de monetização
    - Palavras-chave otimizadas para SEO
    - Em ${languageMap[language as string] || "português brasileiro"}
    
    Para cada categoria, forneça:
    - Nome da categoria
    - Slug (formato URL-friendly)
    - Descrição curta explicando por que é uma boa categoria`;

    console.log("Sugerindo categorias:", { niche, language });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "Você é um especialista em SEO e monetização AdSense. Retorne sempre JSON válido.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_categories",
              description: "Sugere 10 categorias otimizadas para um nicho específico",
              parameters: {
                type: "object",
                properties: {
                  categories: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        slug: { type: "string" },
                        description: { type: "string" }
                      },
                      required: ["name", "slug", "description"],
                      additionalProperties: false
                    },
                    minItems: 10,
                    maxItems: 10
                  }
                },
                required: ["categories"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "suggest_categories" } }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Erro ao sugerir categorias:", response.status, error);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente mais tarde." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos na sua workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Erro ao sugerir categorias: ${error}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("Categorias não geradas");
    }

    const categories = JSON.parse(toolCall.function.arguments).categories;

    console.log("Categorias sugeridas:", categories.length);

    return new Response(
      JSON.stringify({ categories }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});