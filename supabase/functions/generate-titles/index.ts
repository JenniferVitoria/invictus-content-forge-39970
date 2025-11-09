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
    const { category, niche, language = "pt" } = await req.json();
    
    if (!category) {
      throw new Error("Categoria é obrigatória");
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

    const prompt = `Gere 10 títulos otimizados e chamativos para artigos sobre "${category}"${niche ? ` no nicho de ${niche}` : ""}. 
    
    Requisitos:
    - Títulos devem ser relevantes e agregar valor real
    - Use palavras-chave de alto volume de busca
    - Seja criativo e chamativo
    - Adequado para monetização AdSense
    - Otimizado para SEO
    - Em ${languageMap[language as string] || "português brasileiro"}
    
    Retorne APENAS uma lista JSON com os títulos no formato:
    {
      "titles": ["título 1", "título 2", ...]
    }`;

    console.log("Gerando títulos:", { category, niche, language });

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
            content: "Você é um especialista em criação de títulos otimizados para SEO e AdSense. Retorne sempre JSON válido.",
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
              name: "generate_titles",
              description: "Gera 10 títulos otimizados para artigos",
              parameters: {
                type: "object",
                properties: {
                  titles: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 10,
                    maxItems: 10
                  }
                },
                required: ["titles"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_titles" } }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Erro ao gerar títulos:", response.status, error);
      
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
      
      throw new Error(`Erro ao gerar títulos: ${error}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("Títulos não gerados");
    }

    const titles = JSON.parse(toolCall.function.arguments).titles;

    console.log("Títulos gerados:", titles.length);

    return new Response(
      JSON.stringify({ titles }),
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