/**
 * weekly-generate.ts
 * Gera automaticamente a newsletter semanal Radar IA & Tech usando LLM
 * Uso: pnpm weekly
 */
import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { invokeLLM } from "../server/_core/llm.js";

const DRAFT_PATH = path.join(process.cwd(), "scripts", "weekly-draft.md");

// Calcular datas da semana atual
function getWeekDates(): { start: string; end: string; label: string; editionNumber: number } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=domingo, 1=segunda...
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const formatDate = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
  const formatYear = (d: Date) => d.getFullYear();

  const label = `${formatDate(monday)} a ${formatDate(sunday)} de ${formatYear(sunday)}`;
  
  // Número da edição baseado em semanas desde 24/03/2026 (semana 1)
  const epoch = new Date("2026-03-24");
  const diffMs = monday.getTime() - epoch.getTime();
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  const editionNumber = Math.max(1, diffWeeks + 1);

  return {
    start: monday.toISOString().split("T")[0],
    end: sunday.toISOString().split("T")[0],
    label,
    editionNumber,
  };
}

const WEEKLY_PROMPT = (weekLabel: string, editionNumber: number) => `Você é o Editor-Chefe do **Radar IA & Tech**, uma newsletter semanal premium em português brasileiro sobre inteligência artificial e tecnologia, com forte viés analítico e de negócios.

Hoje é ${new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}. Gere a **Edição #${editionNumber}** do Radar IA & Tech, cobrindo a semana de ${weekLabel}.

Pesquise e analise as notícias mais importantes da semana em IA e tecnologia. Foque em:
- Lançamentos de modelos e produtos de IA (OpenAI, Google, Anthropic, Meta, xAI, Mistral)
- Movimentos estratégicos de Big Tech
- Startups com rodadas de investimento relevantes
- Desenvolvimentos em China e Ásia
- Pesquisas e papers científicos de impacto
- Dev Tools e infraestrutura (MCP, frameworks agênticos, etc.)
- Regulação e política de IA
- Implicações para negócios

---

FORMATO OBRIGATÓRIO DA NEWSLETTER (siga EXATAMENTE esta estrutura):

# Radar IA & Tech — Edição #${editionNumber}
**Semana de ${weekLabel}**

---

## Editorial: O Sinal no Ruído

[3-4 parágrafos de texto corrido. Conecte 3-4 histórias da semana em uma narrativa coerente. Identifique o tema dominante, o risco central e a oportunidade principal. Tom: analítico, direto, opinativo mas fundamentado. Sem jargões de marketing.]

---

## Big Tech

### [Título da história 1]
**Impacto:** [1 linha de impacto direto]
[2-3 parágrafos de análise em texto corrido]

### [Título da história 2]
**Impacto:** [1 linha de impacto direto]
[2-3 parágrafos de análise em texto corrido]

---

## Startups & Mercado

### [Título]
**Impacto:** [1 linha]
[2-3 parágrafos]

---

## China & Ásia

### [Título]
**Impacto:** [1 linha]
[2-3 parágrafos]

---

## Pesquisa

### [Título]
**Impacto:** [1 linha]
[2-3 parágrafos]

---

## Dev Tools & Infraestrutura

### [Título]
**Impacto:** [1 linha]
[2-3 parágrafos]

---

## Regulação & Política

### [Título]
**Impacto:** [1 linha]
[2-3 parágrafos]

---

## Visão de Negócio

[2-3 parágrafos conectando os desenvolvimentos da semana com implicações práticas para líderes de negócio, empreendedores e builders. Foco em: o que fazer agora, o que monitorar, o que evitar.]

---

## Radar de Mercado

**1. [Título curto]:** [1-2 linhas de contexto]
**2. [Título curto]:** [1-2 linhas de contexto]
**3. [Título curto]:** [1-2 linhas de contexto]

---

*Radar IA & Tech é publicado semanalmente pela PapayaNews. Conteúdo gerado com curadoria editorial e análise humana.*

---

REQUISITOS:
- Idioma: Português (Brasil), tom profissional e direto
- Extensão total: ~3.000-4.000 palavras
- Texto corrido, sem bullet points excessivos
- Evite termos como "CTA", "engagement", "stakeholders"
- Cada seção deve ter pelo menos 2 histórias relevantes
- O editorial deve identificar claramente: 1 insight principal, 1 risco da semana
- Seja específico com números, datas e nomes de empresas/produtos`;

async function generateWeeklyNewsletter() {
  const { label: weekLabel, editionNumber } = getWeekDates();

  console.log(`\n📡 Radar IA & Tech — Geração de Newsletter Semanal`);
  console.log(`📅 Edição #${editionNumber} — Semana de ${weekLabel}`);
  console.log("═══════════════════════════════════════════════════");
  console.log("🤖 Chamando LLM para gerar conteúdo editorial...");
  console.log("   (Aguarde 3-5 minutos)\n");

  const startTime = Date.now();

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Você é um editor especializado em newsletters de tecnologia e IA, com foco em análise de negócios e insights técnicos. Produz conteúdo em português brasileiro, profissional e analítico.",
        },
        {
          role: "user",
          content: WEEKLY_PROMPT(weekLabel, editionNumber),
        },
      ],
    });

    const content = response.choices[0].message.content;
    const markdownContent = typeof content === "string" ? content : "";

    if (!markdownContent || markdownContent.length < 2000) {
      throw new Error(`Conteúdo gerado muito curto: ${markdownContent.length} caracteres`);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ Conteúdo gerado em ${elapsed}s`);
    console.log(`   Tamanho: ${markdownContent.length} caracteres`);

    // Salvar rascunho
    fs.writeFileSync(DRAFT_PATH, markdownContent, "utf-8");
    console.log(`\n💾 Rascunho salvo em: ${DRAFT_PATH}`);

    // Preview
    const firstLines = markdownContent.split("\n").slice(0, 8).join("\n");
    console.log("\n=== PREVIEW ===");
    console.log(firstLines);
    console.log("...\n");

    console.log("─────────────────────────────────────────────────────");
    console.log("💡 Próximo passo: pnpm weekly:publish (para publicar)");
    console.log("─────────────────────────────────────────────────────\n");

    return { success: true, path: DRAFT_PATH, chars: markdownContent.length };
  } catch (error) {
    console.error(`\n❌ Erro na geração: ${error}`);
    throw error;
  }
}

generateWeeklyNewsletter().catch(console.error);
