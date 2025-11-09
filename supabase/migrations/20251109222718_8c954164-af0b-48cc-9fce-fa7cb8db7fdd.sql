-- Criar tabela de tipos de planos com limites e recursos
CREATE TABLE public.plan_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  monthly_invicoins INTEGER NOT NULL,
  max_articles_per_month INTEGER NOT NULL,
  max_sites INTEGER NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir planos padrão
INSERT INTO public.plan_types (name, display_name, monthly_invicoins, max_articles_per_month, max_sites, features, price_monthly) VALUES
('start', 'Start', 20, 5, 1, '["Geração básica de artigos", "1 site WordPress", "Suporte por email"]'::jsonb, 0),
('pro', 'Pro', 100, 50, 5, '["Geração avançada de artigos", "5 sites WordPress", "Geração de imagens", "Suporte prioritário"]'::jsonb, 29.90),
('premium', 'Premium', 500, 200, 20, '["Geração ilimitada de artigos", "20 sites WordPress", "Geração de imagens HD", "Suporte VIP 24/7", "API access"]'::jsonb, 99.90);

-- Criar tabela de códigos de verificação de email
CREATE TABLE public.email_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  email TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índice para busca rápida
CREATE INDEX idx_email_verification_codes_user_id ON public.email_verification_codes(user_id);
CREATE INDEX idx_email_verification_codes_code ON public.email_verification_codes(code);

-- Habilitar RLS
ALTER TABLE public.plan_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_verification_codes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para plan_types (todos podem ver)
CREATE POLICY "Todos podem ver tipos de planos"
  ON public.plan_types
  FOR SELECT
  USING (true);

-- Políticas RLS para email_verification_codes
CREATE POLICY "Usuários podem ver seus próprios códigos"
  ON public.email_verification_codes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios códigos"
  ON public.email_verification_codes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios códigos"
  ON public.email_verification_codes
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Adicionar campo verified no user_profiles
ALTER TABLE public.user_profiles ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT false;

-- Função para limpar códigos expirados
CREATE OR REPLACE FUNCTION public.cleanup_expired_verification_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.email_verification_codes
  WHERE expires_at < now() AND verified = false;
END;
$$;