import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  email: string;
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, userId }: RequestBody = await req.json();

    if (!email || !userId) {
      return new Response(
        JSON.stringify({ error: "Email e userId são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Gerar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Calcular expiração (15 minutos)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Salvar código no banco
    const { error: dbError } = await supabase
      .from("email_verification_codes")
      .insert({
        user_id: userId,
        code: code,
        email: email,
        expires_at: expiresAt,
        verified: false,
      });

    if (dbError) {
      console.error("Erro ao salvar código:", dbError);
      throw dbError;
    }

    // Aqui você pode integrar com um serviço de email como Resend
    // Por enquanto, vamos apenas logar o código (REMOVA EM PRODUÇÃO!)
    console.log(`Código de verificação para ${email}: ${code}`);
    
    // TODO: Integrar com Resend ou outro serviço de email
    // const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    // await resend.emails.send({
    //   from: "Invictus Automatik <noreply@seudominio.com>",
    //   to: [email],
    //   subject: "Código de Verificação - Invictus Automatik",
    //   html: `<p>Seu código de verificação é: <strong>${code}</strong></p><p>Este código expira em 15 minutos.</p>`,
    // });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Código enviado com sucesso",
        // Temporariamente retornar o código para teste (REMOVA EM PRODUÇÃO!)
        code: code 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Erro:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
