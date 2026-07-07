import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { logAnthropicUsage } from "./uso-ia.server";

const Input = z.object({
  texto: z.string().min(1),
  tipo: z.string().optional(),
});

export type ReescreverOutput = {
  A: string;
  B: string;
  AB: string;
  C: string;
};

const SYSTEM = `Você é o reescritor de marca da NL Arquitetos, escritório de arquitetura e interiores em São José dos Campos, SP.
Lema: "A arquitetura como decisão."

Reescreva o texto recebido em 4 versões, uma por linha de negócio.
Cada versão respeita TODAS as regras da marca NL:
- Sem emoji
- Sem superlativo vazio
- Sem urgência artificial
- CTA sempre de baixo atrito
- Tom: técnico com empatia

TONS POR LINHA:
- Linha A (Arquitetura Residencial): foco técnico, estrutural, "sem improviso no canteiro". Palavras-chave: projeto, viabilidade, compatibilização, planta, aprovação, canteiro, decisão técnica.
- Linha B (Interiores Residencial): técnico com sensibilidade, foco em funcionalidade real de uso. Como o espaço vai ser vivido, não só como vai parecer.
- Linha A+B (Integrado): argumento central — arquitetura e interiores pensados juntos evitam incompatibilidades descobertas só na obra.
- Linha C (Comercial): direto e estratégico. Retorno do espaço para o negócio: atrair clientes, produtividade, identidade da marca, fluxo operacional.

Responda EXCLUSIVAMENTE com JSON puro, sem markdown:
{
  "A": "texto reescrito para Linha A",
  "B": "texto reescrito para Linha B",
  "AB": "texto reescrito para Linha A+B",
  "C": "texto reescrito para Linha C"
}`;

export const reescreverPorLinha = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }): Promise<ReescreverOutput> => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || !apiKey.trim()) {
      throw new Error(
        "A chave da Anthropic (ANTHROPIC_API_KEY) não foi configurada. Adicione o secret no backend antes de reescrever.",
      );
    }

    const userPrompt = [
      data.tipo ? `Tipo de peça: ${data.tipo}` : "",
      "Texto original:",
      data.texto,
      "",
      "Responda EXCLUSIVAMENTE com o objeto JSON. Sem texto antes, sem texto depois, sem markdown.",
    ]
      .filter(Boolean)
      .join("\n");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4000,
        system: SYSTEM,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) throw new Error("Limite de requisições atingido. Tente novamente em instantes.");
      if (res.status === 402) throw new Error("Créditos de IA esgotados. Adicione créditos no workspace.");
      throw new Error(`Falha na IA (${res.status}): ${body.slice(0, 200)}`);
    }

    const json = await res.json();
    const content: string = json?.content?.[0]?.text ?? "";
    const stopReason: string = json?.stop_reason ?? "";
    await logAnthropicUsage({
      modulo: "reescrever",
      operacao: "reescrita_linha",
      tokens_input: json?.usage?.input_tokens ?? 0,
      tokens_output: json?.usage?.output_tokens ?? 0,
      detalhes: { tipo: data.tipo ?? null, chars: data.texto.length },
    });
    if (stopReason === "max_tokens") {
      throw new Error("A resposta da IA foi cortada por limite de tokens. Tente novamente com um texto menor.");
    }
    let parsed: ReescreverOutput;
    try {
      parsed = JSON.parse(content);
    } catch {
      const cleaned = content.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      if (start === -1 || end === -1 || end <= start) {
        throw new Error("Resposta da IA não estava em JSON válido.");
      }
      let candidate = cleaned.slice(start, end + 1);
      try {
        parsed = JSON.parse(candidate);
      } catch {
        candidate = candidate.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]").replace(/[\x00-\x1F\x7F]/g, " ");
        parsed = JSON.parse(candidate);
      }
    }
    return parsed;
  });