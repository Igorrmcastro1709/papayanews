import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { featuredContent } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

async function updateURLs() {
  console.log("🔄 Atualizando URLs dos conteúdos...");

  // Atualizar Yann LeCun
  await db.update(featuredContent)
    .set({ link: "https://www.youtube.com/watch?v=Ah6nR8YAYF4" })
    .where(eq(featuredContent.title, "Yann Le Cun – Os novos desafios da IA"));
  console.log("✅ URL de Yann LeCun atualizado");

  // Atualizar Fei-Fei Li
  await db.update(featuredContent)
    .set({ link: "https://www.youtube.com/watch?v=60iW8FZ7MJU" })
    .where(eq(featuredContent.title, "Fei-Fei Li - From Words to Worlds"));
  console.log("✅ URL de Fei-Fei Li atualizado");

  console.log("🎉 Todos os URLs foram atualizados!");
  process.exit(0);
}

updateURLs().catch((error) => {
  console.error("❌ Erro ao atualizar URLs:", error);
  process.exit(1);
});
