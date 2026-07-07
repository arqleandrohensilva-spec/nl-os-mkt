import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { validarPeca, type ValidarOutput } from "@/lib/validar.functions";
import { PageHeader } from "@/components/page-header";
import { Loader2, AlertTriangle, CheckCircle2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/validar")({
  component: ValidarPage,
});

function ValidarPage() {
  const validar = useServerFn(validarPeca);
  const [texto, setTexto] = useState("");
  const [resultado, setResultado] = useState<ValidarOutput | null>(null);

  const mut = useMutation({
    mutationFn: async () => validar({ data: { texto } }),
    onSuccess: (data) => setResultado(data),
    onError: (err: any) => toast.error(err?.message ?? "Erro ao validar peça"),
  });

  const resetar = () => {
    setTexto("");
    setResultado(null);
  };

  const score = resultado?.score ?? 0;
  const scoreColor =
    score >= 80 ? "#3F6E4F" : score >= 60 ? "#B8873A" : "#A0392E";

  return (
    <>
      <PageHeader
        eyebrow="Detector de Régua de Marca"
        title="Validar peça"
        description="Cole o texto antes de publicar. O sistema verifica se a peça respeita a identidade da NL."
      />

      <div className="px-4 md:px-10 py-8 max-w-4xl space-y-6">
        {!resultado && (
          <>
            <label className="block">
              <div className="font-mono text-[10px] tracking-widest text-[color:var(--bronze)] mb-2">
                TEXTO PARA VALIDAR
              </div>
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Cole aqui a legenda, roteiro ou CTA que quer validar…"
                className="w-full rounded-[4px] border border-[color:var(--divisoria)] bg-[color:var(--gelo)] px-3 py-3 text-sm focus:outline-none focus:border-[color:var(--bronze)] resize-y"
                style={{ minHeight: 200 }}
              />
            </label>

            <button
              disabled={!texto.trim() || mut.isPending}
              onClick={() => mut.mutate()}
              className="inline-flex items-center gap-2 rounded-[4px] bg-[color:var(--graphite)] px-5 py-2.5 text-sm text-white hover:bg-[color:var(--bronze)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {mut.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Analisando…
                </>
              ) : (
                "Analisar"
              )}
            </button>
          </>
        )}

        {resultado && (
          <div className="space-y-6">
            <section className="border border-[color:var(--divisoria)] rounded-lg bg-white p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:gap-8">
                <div className="flex items-baseline gap-2">
                  <div
                    style={{ fontFamily: "Georgia, serif", color: scoreColor }}
                    className="text-6xl md:text-7xl leading-none"
                  >
                    {score}
                  </div>
                  <div className="font-mono text-[10px] tracking-widest text-[color:var(--bronze)]">
                    / 100
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex-1">
                  <div className="font-mono text-[10px] tracking-widest text-[color:var(--bronze)] mb-2">
                    {resultado.aprovado ? "APROVADO" : "PRECISA DE AJUSTE"}
                  </div>
                  <p className="text-sm text-[color:var(--graphite)] leading-relaxed">
                    {resultado.resumo}
                  </p>
                </div>
              </div>
            </section>

            {resultado.problemas.length > 0 && (
              <section className="border border-[color:var(--divisoria)] rounded-lg bg-white p-5 md:p-6">
                <div className="font-mono text-[10px] tracking-widest text-[color:var(--bronze)] mb-4">
                  PROBLEMAS ENCONTRADOS
                </div>
                <ul className="space-y-4">
                  {resultado.problemas.map((p, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <AlertTriangle
                        className="h-4 w-4 mt-0.5 shrink-0"
                        style={{ color: "#A0392E" }}
                      />
                      <div className="min-w-0 text-sm">
                        <div className="text-[color:var(--graphite)] font-medium">
                          {p.regra}
                        </div>
                        {p.trecho && (
                          <div className="mt-1 italic text-[color:var(--muted-foreground)]">
                            "{p.trecho}"
                          </div>
                        )}
                        <div className="mt-1 text-[color:var(--graphite)]">
                          {p.sugestao}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {resultado.acertos.length > 0 && (
              <section className="border border-[color:var(--divisoria)] rounded-lg bg-white p-5 md:p-6">
                <div className="font-mono text-[10px] tracking-widest text-[color:var(--bronze)] mb-4">
                  BOAS PRÁTICAS ENCONTRADAS
                </div>
                <ul className="space-y-3">
                  {resultado.acertos.map((a, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <CheckCircle2
                        className="h-4 w-4 mt-0.5 shrink-0"
                        style={{ color: "#3F6E4F" }}
                      />
                      <span className="text-[color:var(--graphite)]">{a}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="pt-2">
              <button
                onClick={resetar}
                className="inline-flex items-center gap-2 rounded-[4px] border border-[color:var(--divisoria)] bg-white px-5 py-2.5 text-sm text-[color:var(--graphite)] hover:border-[color:var(--bronze)] transition-colors"
              >
                <RotateCcw className="h-4 w-4" /> Analisar novamente
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}