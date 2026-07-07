CREATE TABLE public.analises_concorrentes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  handle text NOT NULL,
  nicho text,
  legendas_brutas text NOT NULL,
  resultado jsonb NOT NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.analises_concorrentes TO anon, authenticated;
GRANT ALL ON public.analises_concorrentes TO service_role;
ALTER TABLE public.analises_concorrentes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open analises" ON public.analises_concorrentes
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);