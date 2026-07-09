
CREATE TABLE public.antes_depois (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  projeto_id uuid REFERENCES public.projetos(id) ON DELETE SET NULL,
  nome text NOT NULL,
  linha text NOT NULL,
  imagem_antes_id uuid REFERENCES public.biblioteca_imagens(id) ON DELETE SET NULL,
  imagem_depois_id uuid REFERENCES public.biblioteca_imagens(id) ON DELETE SET NULL,
  ambiente text,
  descricao_transformacao text,
  conteudos jsonb,
  status_publicacao jsonb NOT NULL DEFAULT
    '{"feed":false,"stories":false,"reels":false,"carrossel":false,"blog":false,"email":false}'::jsonb
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.antes_depois TO anon, authenticated;
GRANT ALL ON public.antes_depois TO service_role;

ALTER TABLE public.antes_depois ENABLE ROW LEVEL SECURITY;

CREATE POLICY "open antes_depois" ON public.antes_depois
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Substituir status_publicacao (text) por status_canais (jsonb) em biblioteca_imagens
ALTER TABLE public.biblioteca_imagens DROP COLUMN IF EXISTS status_publicacao;

ALTER TABLE public.biblioteca_imagens
  ADD COLUMN IF NOT EXISTS status_canais jsonb NOT NULL DEFAULT
    '{"feed":false,"stories":false,"reels":false,"carrossel":false,"blog":false,"email":false}'::jsonb;
