/**
 * weekly-publish.ts
 * Publica o rascunho semanal do Radar IA & Tech no banco de dados
 * Uso: pnpm weekly:publish
 */
import "dotenv/config";
import * as fs from "fs";
import * as path from "path";

const DRAFT_PATH = path.join(process.cwd(), "scripts", "weekly-draft.md");
const LAST_EDITION_PATH = path.join(process.cwd(), "scripts", "last-weekly-edition.md");

async function publishWeeklyEdition() {
  console.log(`\n📡 Radar IA & Tech — Publicação de Edição Semanal`);
  console.log("═══════════════════════════════════════════════════");

  // Verificar se existe rascunho
  if (!fs.existsSync(DRAFT_PATH)) {
    console.error("❌ Nenhum rascunho encontrado. Execute pnpm weekly primeiro.");
    process.exit(1);
  }

  const markdownContent = fs.readFileSync(DRAFT_PATH, "utf-8");
  
  // Extrair título e assunto do conteúdo
  const lines = markdownContent.split("\n");
  const titleLine = lines.find(l => l.startsWith("# ")) || "# Radar IA & Tech";
  const weekLine = lines.find(l => l.startsWith("**Semana de")) || "";
  
  const title = titleLine.replace(/^#+\s*/, "").trim();
  const subject = `${title} — ${weekLine.replace(/\*\*/g, "").trim()}`;

  console.log(`\n📰 Publicando: ${title}`);
  console.log(`📅 ${weekLine.replace(/\*\*/g, "").trim()}`);
  console.log(`📊 Tamanho: ${markdownContent.length} caracteres`);

  // Verificar DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.warn("\n⚠️  DATABASE_URL não configurada. Publicação no banco não disponível.");
    console.log("\n📄 Salvando edição localmente como publicada...");
    
    // Salvar como última edição publicada
    fs.writeFileSync(LAST_EDITION_PATH, markdownContent, "utf-8");
    
    // Remover rascunho
    fs.unlinkSync(DRAFT_PATH);
    
    console.log(`\n✅ Edição salva em: ${LAST_EDITION_PATH}`);
    console.log("ℹ️  Para publicar no banco de dados, configure DATABASE_URL no .env");
    
    printSummary(markdownContent, title);
    return;
  }

  try {
    console.log("\n🔌 Conectando ao banco de dados...");
    
    const { createNewsletter } = await import("../server/db.js");
    
    // Converter markdown para HTML básico (preservando estrutura)
    const htmlContent = markdownContent
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/^---$/gm, "<hr>")
      .replace(/\n\n/g, "</p><p>")
      .replace(/^(?!<[h|p|hr])/gm, "<p>")
      .replace(/(?<![>])$/gm, "</p>");

    const newsletter = await createNewsletter({
      title,
      subject,
      content: htmlContent,
      status: "sent",
      sentAt: new Date(),
      createdBy: 1,
    });

    console.log(`\n✅ Newsletter publicada no banco de dados!`);
    console.log(`   ID: ${(newsletter as any)?.insertId || "N/A"}`);
    console.log(`   Status: sent`);
    console.log(`   Data: ${new Date().toISOString()}`);

    // Salvar como última edição e remover rascunho
    fs.writeFileSync(LAST_EDITION_PATH, markdownContent, "utf-8");
    fs.unlinkSync(DRAFT_PATH);

    printSummary(markdownContent, title);

  } catch (error) {
    console.error(`\n❌ Erro ao publicar no banco: ${error}`);
    
    // Fallback: salvar localmente
    fs.writeFileSync(LAST_EDITION_PATH, markdownContent, "utf-8");
    console.log(`\n💾 Fallback: Edição salva em: ${LAST_EDITION_PATH}`);
    console.log("⚠️  Publicação no banco falhou, mas o conteúdo foi preservado.");
    
    printSummary(markdownContent, title);
  }
}

function printSummary(content: string, title: string) {
  // Extrair destaques do editorial
  const editorialMatch = content.match(/## Editorial: O Sinal no Ruído\n\n([\s\S]+?)(?=\n---)/);
  const editorial = editorialMatch ? editorialMatch[1].trim() : "";
  const editorialPreview = editorial.split("\n")[0].substring(0, 200);

  console.log("\n═══════════════════════════════════════════════════");
  console.log("🎉 PUBLICAÇÃO CONCLUÍDA!");
  console.log(`\n📰 ${title}`);
  console.log(`\n💡 Editorial: ${editorialPreview}...`);
  console.log("\n🌐 Acesse: https://8081-ikw5eagz9fsppujj1723t-324665f5.us2.manus.computer");
  console.log("═══════════════════════════════════════════════════\n");
}

publishWeeklyEdition().catch(console.error);
