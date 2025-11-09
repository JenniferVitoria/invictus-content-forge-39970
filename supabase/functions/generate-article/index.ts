import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, keyword, language = "pt" } = await req.json();
    
    if (!title || !keyword) {
      throw new Error("Título e palavra-chave são obrigatórios");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    // Prompt otimizado para artigos AdSense
    const prompt = `Escreva um artigo com pelo menos 2000 palavras sobre o tema "${title}". O tom deve ser conversacional e informativo, focando em fornecer dicas detalhadas e aplicáveis. O conteúdo precisa ser original, evitando informações genéricas ou triviais, e deve agregar valor real ao leitor. Inclua a palavra-chave "${keyword}" naturalmente nos primeiros parágrafos e em pelo menos um título H2 ou H3. Distribua a palavra-chave de forma uniforme ao longo do texto, mantendo uma densidade de aproximadamente 1%, sem comprometer a fluidez da leitura, a palavra chave deve aparecer pelo menos 12 vezes. Além da palavra chave principal, crie palavras chave relevantes e inclua durante o texto e títulos. Organize o conteúdo com parágrafos que desenvolvam ideias completas, mantendo uma média de 100 a 150 palavras por parágrafo. Utilize pelo menos cinco títulos H2 informativos, destacando pontos importantes, e evite incluir numeração nos títulos. Use descrições claras e diretas nos títulos para refletir o conteúdo subsequente. Quando possível, inclua listas e links relevantes para enriquecer o artigo. Certifique-se de que o conteúdo esteja em conformidade com as diretrizes do AdSense, oferecendo insights úteis, exemplos práticos e observações pessoais para engajar o leitor. Revise o texto manualmente para garantir coesão e evitar repetições. Finalize com perguntas que incentivem a interação dos leitores nos comentários e um FAQ no final. Formate o artigo em HTML, usando apenas as tags de conteúdo: <h1>, <h2>, <p>, <ul>, <li>, <strong> e <em> para ser publicado como post no editor do WordPress.`;

    console.log("Gerando artigo:", { title, keyword, language });

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
            content: `Você é um escritor especializado em criar conteúdo otimizado para SEO e AdSense. Escreva em ${language === "pt" ? "português brasileiro" : language === "en" ? "inglês" : language === "es" ? "espanhol" : "italiano"}.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Erro ao gerar artigo:", response.status, error);
      
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
      
      throw new Error(`Erro ao gerar artigo: ${error}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Conteúdo não gerado");
    }

    console.log("Artigo gerado com sucesso");

    return new Response(
      JSON.stringify({ content }),
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