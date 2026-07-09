
CREATE TABLE public.lancamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  nome text NOT NULL,
  tipo text NOT NULL,
  cidade text NOT NULL,
  construtora text,
  bairro text,
  faixa_preco text,
  descricao text,
  url_fonte text,
  data_lancamento text,
  status text DEFAULT 'novo',
  oportunidade_linha text,
  conteudos jsonb,
  notas text
);

CREATE TABLE public.radar_buscas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  resultados_encontrados int DEFAULT 0,
  novos_lancamentos int DEFAULT 0,
  resumo text
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lancamentos TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.radar_buscas TO anon, authenticated;
GRANT ALL ON public.lancamentos TO service_role;
GRANT ALL ON public.radar_buscas TO service_role;

ALTER TABLE public.lancamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radar_buscas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "open lancamentos" ON public.lancamentos
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "open radar_buscas" ON public.radar_buscas
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
