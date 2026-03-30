/**
 * weekly-status.ts
 * Verifica o estado atual do sistema de newsletter semanal Radar IA & Tech
 * Uso: pnpm weekly:status
 */
import "dotenv/config";
import * as fs from "fs";
import * as path from "path";

const DRAFT_PATH = path.join(process.cwd(), "scripts", "weekly-draft.md");
const LAST_EDITION_PATH = path.join(process.cwd(), "scripts", "last-weekly-edition.md");

async function checkStatus() {
  console.log("\n📡 Radar IA & Tech — Sistema de Newsletter Semanal");
  console.log("═══════════════════════════════════════════════════");
  
  // Verificar rascunho pendente
  const hasDraft = fs.existsSync(DRAFT_PATH);
  if (hasDraft) {
    const draftStats = fs.statSync(DRAFT_PATH);
    const draftContent = fs.readFileSync(DRAFT_PATH, "utf-8");
    const firstLine = draftContent.split("\n").find(l => l.trim().length > 0) || "";
    console.log(`\n📝 Rascunho pendente: SIM`);
    console.log(`   Arquivo: ${DRAFT_PATH}`);
    console.log(`   Tamanho: ${draftContent.length} caracteres`);
    console.log(`   Título: ${firstLine.replace(/^#+\s*/, "")}`);
    console.log(`   Modificado: ${draftStats.mtime.toLocaleString("pt-BR")}`);
  } else {
    console.log(`\n📝 Rascunho pendente: NÃO`);
  }

  // Verificar última edição publicada
  const hasLastEdition = fs.existsSync(LAST_EDITION_PATH);
  if (hasLastEdition) {
    const lastStats = fs.statSync(LAST_EDITION_PATH);
    const lastContent = fs.readFileSync(LAST_EDITION_PATH, "utf-8");
    const firstLine = lastContent.split("\n").find(l => l.trim().length > 0) || "";
    console.log(`\n✅ Última edição publicada:`);
    console.log(`   Título: ${firstLine.replace(/^#+\s*/, "")}`);
    console.log(`   Publicado em: ${lastStats.mtime.toLocaleString("pt-BR")}`);
  } else {
    console.log(`\n✅ Última edição publicada: Nenhuma ainda`);
  }

  // Verificar DATABASE_URL
  const hasDb = !!process.env.DATABASE_URL;
  console.log(`\n🗄️  Banco de dados: ${hasDb ? "CONECTADO" : "NÃO CONFIGURADO"}`);
  
  if (hasDb) {
    try {
      const { listNewsletters } = await import("../server/db.js");
      const newsletters = await listNewsletters();
      const weeklyNewsletters = newsletters.filter(n => 
        n.title.includes("Radar IA") || n.title.includes("radar-ia")
      );
      console.log(`   Total de edições Radar IA & Tech no banco: ${weeklyNewsletters.length}`);
      if (weeklyNewsletters.length > 0) {
        const latest = weeklyNewsletters[0];
        console.log(`   Última: ${latest.title} (${latest.status})`);
      }
    } catch (err) {
      console.log(`   ⚠️  Erro ao consultar banco: ${err}`);
    }
  }

  console.log(`\n📅 Data atual: ${new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric"
  })}`);
  
  console.log("\n─────────────────────────────────────────────────────");
  if (hasDraft) {
    console.log("💡 Próximo passo: pnpm weekly:publish (para publicar o rascunho)");
  } else {
    console.log("💡 Próximo passo: pnpm weekly (para gerar nova edição)");
  }
  console.log("─────────────────────────────────────────────────────\n");
}

checkStatus().catch(console.error);
