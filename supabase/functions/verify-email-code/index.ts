import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  code: string;
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, userId }: RequestBody = await req.json();

    if (!code || !userId) {
      return new Response(
        JSON.stringify({ error: "Código e userId são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar código
    const { data: verificationData, error: fetchError } = await supabase
      .from("email_verification_codes")
      .select("*")
      .eq("user_id", userId)
      .eq("code", code)
      .eq("verified", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !verificationData) {
      return new Response(
        JSON.stringify({ error: "Código inválido ou expirado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Marcar código como verificado
    const { error: updateCodeError } = await supabase
      .from("email_verification_codes")
      .update({ verified: true })
      .eq("id", verificationData.id);

    if (updateCodeError) {
      console.error("Erro ao atualizar código:", updateCodeError);
      throw updateCodeError;
    }

    // Atualizar perfil do usuário
    const { error: updateProfileError } = await supabase
      .from("user_profiles")
      .update({ email_verified: true })
      .eq("user_id", userId);

    if (updateProfileError) {
      console.error("Erro ao atualizar perfil:", updateProfileError);
      throw updateProfileError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email verificado com sucesso!" 
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
