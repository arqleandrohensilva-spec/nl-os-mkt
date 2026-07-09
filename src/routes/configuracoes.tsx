import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listarPerfisBuffer, salvarTokenBuffer, testarConexaoBuffer } from "@/lib/buffer.functions";
import { PageHeader } from "@/components/page-header";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, Send } from "lucide-react";

export const Route = createFileRoute("/configuracoes")({
  component: ConfiguracoesPage,
});

function ConfiguracoesPage() {
  const testar = useServerFn(testarConexaoBuffer);
  const salvar = useServerFn(salvarTokenBuffer);
  const listar = useServerFn(listarPerfisBuffer);
  const [token, setToken] = useState("");

  const perfis = useQuery({
    queryKey: ["buffer-profiles-config"],
    queryFn: () => listar(),
    staleTime: 30_000,
  });

  const testMut = useMutation({
    mutationFn: async () => testar({ data: token ? { token } : {} }),
    onSuccess: (r) => {
      if (r.ok) toast.success(r.message);
      else toast.error(r.message);
    },
    onError: (e: any) => toast.error(e?.message ?? "Falha ao testar"),
  });

  const saveMut = useMutation({
    mutationFn: async () => salvar({ data: { token } }),
    onSuccess: () => {
      toast.success("Token do Buffer salvo.");
      setToken("");
      perfis.refetch();
    },
    onError: (e: any) => toast.error(e?.message ?? "Falha ao salvar token"),
  });

  const profiles = perfis.data?.profiles ?? [];
  const conectado = !perfis.data?.error && profiles.length > 0;

  return (
    <>
      <PageHeader
        eyebrow="Configurações"
        title="Integrações"
        description="Conecte serviços externos ao NL OS MKT. As credenciais são armazenadas com segurança no backend."
      />

      <div className="px-4 md:px-10 py-8 space-y-8 max-w-3xl">
        <section className="border border-[color:var(--divisoria)] rounded-lg bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4 text-[color:var(--bronze)]" />
              <div className="font-serif text-lg text-[color:var(--graphite)]">Buffer</div>
            </div>
            {perfis.isLoading ? (
              <span className="text-xs text-[color:var(--muted-foreground)] inline-flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" /> verificando…
              </span>
            ) : conectado ? (
              <span className="inline-flex items-center gap-1 text-xs text-green-700">
                <CheckCircle2 className="h-4 w-4" /> Conectado — {profiles.length} perfil(is)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-red-600">
                <XCircle className="h-4 w-4" /> {perfis.data?.error ?? "Não conectado"}
              </span>
            )}
          </div>

          <p className="text-sm text-[color:var(--muted-foreground)] leading-relaxed">
            Para agendar posts, gere um Access Token em{" "}
            <a
              href="https://buffer.com/developers/apps"
              target="_blank"
              rel="noreferrer"
              className="underline text-[color:var(--bronze)]"
            >
              buffer.com/developers/apps
            </a>
            . O token fica salvo no backend e é usado somente para agendar publicações.
          </p>

          <label className="block">
            <div className="font-mono text-[10px] tracking-widest text-[color:var(--bronze)] mb-2">
              BUFFER ACCESS TOKEN
            </div>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="1/abc123…"
              className="w-full rounded-[4px] border border-[color:var(--divisoria)] bg-[color:var(--gelo)] px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--bronze)]"
              autoComplete="off"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              disabled={testMut.isPending}
              onClick={() => testMut.mutate()}
              className="inline-flex items-center gap-2 rounded-[4px] border border-[color:var(--divisoria)] bg-white px-4 py-2 text-sm text-[color:var(--graphite)] hover:border-[color:var(--bronze)] disabled:opacity-40"
            >
              {testMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Testar conexão
            </button>
            <button
              disabled={!token.trim() || saveMut.isPending}
              onClick={() => saveMut.mutate()}
              className="inline-flex items-center gap-2 rounded-[4px] bg-[color:var(--graphite)] px-4 py-2 text-sm text-white hover:bg-[color:var(--bronze)] disabled:opacity-40"
            >
              {saveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Salvar token
            </button>
          </div>

          {profiles.length > 0 && (
            <div className="pt-2 border-t border-[color:var(--divisoria)]">
              <div className="font-mono text-[10px] tracking-widest text-[color:var(--bronze)] mb-2">
                PERFIS CONECTADOS
              </div>
              <ul className="space-y-1.5 text-sm">
                {profiles.map((p) => (
                  <li key={p.id} className="flex items-center gap-2">
                    <span className="capitalize text-[color:var(--graphite)]">{p.service}</span>
                    <span className="text-[color:var(--muted-foreground)]">
                      · {p.formatted_username || p.service_username || p.id.slice(0, 8)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
