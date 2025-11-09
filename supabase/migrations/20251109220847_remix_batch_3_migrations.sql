
-- Migration: 20251109215118

-- Migration: 20251109205236

-- Migration: 20251109204158

-- Migration: 20251109203022

-- Migration: 20251109202249
-- Criar tabela de perfis de usuários com InviCoins
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  invi_coins INTEGER NOT NULL DEFAULT 20,
  plan_type TEXT NOT NULL DEFAULT 'start',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: usuários podem ver e editar apenas seu próprio perfil
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seu próprio perfil"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, invi_coins, plan_type)
  VALUES (NEW.id, 20, 'start');
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil quando novo usuário é criado
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- Migration: 20251109203156
-- Tabela para armazenar sites WordPress conectados
CREATE TABLE public.wordpress_sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  site_name TEXT NOT NULL,
  site_url TEXT NOT NULL,
  domain TEXT NOT NULL,
  plugin_active BOOLEAN DEFAULT false,
  api_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para armazenar categorias do site
CREATE TABLE public.site_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.wordpress_sites(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  wordpress_category_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para armazenar artigos gerados
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  site_id UUID NOT NULL REFERENCES public.wordpress_sites(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.site_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  language TEXT NOT NULL DEFAULT 'pt',
  wordpress_post_id INTEGER,
  seo_score INTEGER,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  published_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para armazenar configurações de monetização
CREATE TABLE public.monetization_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  site_id UUID NOT NULL REFERENCES public.wordpress_sites(id) ON DELETE CASCADE,
  step_categories BOOLEAN DEFAULT false,
  step_pages BOOLEAN DEFAULT false,
  step_site_info BOOLEAN DEFAULT false,
  step_permalinks BOOLEAN DEFAULT false,
  step_plugins BOOLEAN DEFAULT false,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para armazenar imagens geradas
CREATE TABLE public.article_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  subtitle TEXT,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wordpress_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monetization_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies para wordpress_sites
CREATE POLICY "Usuários podem ver seus próprios sites"
ON public.wordpress_sites FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios sites"
ON public.wordpress_sites FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios sites"
ON public.wordpress_sites FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios sites"
ON public.wordpress_sites FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies para site_categories
CREATE POLICY "Usuários podem ver categorias de seus sites"
ON public.site_categories FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.wordpress_sites
    WHERE wordpress_sites.id = site_categories.site_id
    AND wordpress_sites.user_id = auth.uid()
  )
);

CREATE POLICY "Usuários podem criar categorias em seus sites"
ON public.site_categories FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.wordpress_sites
    WHERE wordpress_sites.id = site_categories.site_id
    AND wordpress_sites.user_id = auth.uid()
  )
);

CREATE POLICY "Usuários podem atualizar categorias de seus sites"
ON public.site_categories FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.wordpress_sites
    WHERE wordpress_sites.id = site_categories.site_id
    AND wordpress_sites.user_id = auth.uid()
  )
);

CREATE POLICY "Usuários podem deletar categorias de seus sites"
ON public.site_categories FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.wordpress_sites
    WHERE wordpress_sites.id = site_categories.site_id
    AND wordpress_sites.user_id = auth.uid()
  )
);

-- RLS Policies para articles
CREATE POLICY "Usuários podem ver seus próprios artigos"
ON public.articles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios artigos"
ON public.articles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios artigos"
ON public.articles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios artigos"
ON public.articles FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies para monetization_config
CREATE POLICY "Usuários podem ver suas próprias configs"
ON public.monetization_config FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias configs"
ON public.monetization_config FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias configs"
ON public.monetization_config FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies para article_images
CREATE POLICY "Usuários podem ver imagens de seus artigos"
ON public.article_images FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.articles
    WHERE articles.id = article_images.article_id
    AND articles.user_id = auth.uid()
  )
);

CREATE POLICY "Usuários podem criar imagens em seus artigos"
ON public.article_images FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.articles
    WHERE articles.id = article_images.article_id
    AND articles.user_id = auth.uid()
  )
);

-- Triggers para updated_at
CREATE TRIGGER update_wordpress_sites_updated_at
BEFORE UPDATE ON public.wordpress_sites
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_monetization_config_updated_at
BEFORE UPDATE ON public.monetization_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para melhor performance
CREATE INDEX idx_wordpress_sites_user_id ON public.wordpress_sites(user_id);
CREATE INDEX idx_site_categories_site_id ON public.site_categories(site_id);
CREATE INDEX idx_articles_user_id ON public.articles(user_id);
CREATE INDEX idx_articles_site_id ON public.articles(site_id);
CREATE INDEX idx_articles_status ON public.articles(status);
CREATE INDEX idx_article_images_article_id ON public.article_images(article_id);


-- Migration: 20251109204742
-- Força regeneração dos tipos do Supabase
-- Esta migração garante que os tipos TypeScript estejam sincronizados com o schema do banco

-- Adiciona comentários nas tabelas principais para documentação
COMMENT ON TABLE user_profiles IS 'Perfis de usuários com InviCoins e planos';
COMMENT ON TABLE wordpress_sites IS 'Sites WordPress conectados à plataforma';
COMMENT ON TABLE articles IS 'Artigos gerados pela IA';
COMMENT ON TABLE article_images IS 'Imagens dos artigos';
COMMENT ON TABLE site_categories IS 'Categorias dos sites WordPress';
COMMENT ON TABLE monetization_config IS 'Configurações de monetização AdSense';

-- Verifica se as tabelas têm RLS habilitado (apenas para confirmar)
-- Isso não faz alterações, apenas documenta o estado atual
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'user_profiles', 
  'wordpress_sites', 
  'articles', 
  'article_images', 
  'site_categories', 
  'monetization_config'
);




-- Migration: 20251109215612
-- Tabela para rastrear transações e gastos de InvCoins
CREATE TABLE public.invcoin_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'spend', 'refund')),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.invcoin_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem ver suas próprias transações"
  ON public.invcoin_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias transações"
  ON public.invcoin_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Adicionar índices para melhor performance
CREATE INDEX idx_invcoin_transactions_user_id ON public.invcoin_transactions(user_id);
CREATE INDEX idx_invcoin_transactions_created_at ON public.invcoin_transactions(created_at DESC);

-- Migration: 20251109220610
-- Adicionar campos de nome e foto de perfil na tabela user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Atualizar o trigger para incluir o nome ao criar perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_profiles (user_id, invi_coins, plan_type, display_name)
  VALUES (NEW.id, 20, 'start', NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$function$;
