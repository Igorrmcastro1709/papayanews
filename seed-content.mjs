import { drizzle } from "drizzle-orm/mysql2";
import { featuredContent, events } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

async function seed() {
  console.log("🌱 Populando banco de dados com conteúdos iniciais...");

  // Conteúdos destacados
  const contents = [
    {
      title: "Yann Le Cun – Os novos desafios da IA",
      description: "Diretor científico de IA da Meta compartilha insights sobre o futuro da inteligência artificial",
      link: "https://www.youtube.com/watch?v=example1",
      category: "Vídeo",
      order: 1,
      active: 1,
    },
    {
      title: "Fei-Fei Li - From Words to Worlds",
      description: "Pioneira em visão computacional explora a evolução da IA generativa",
      link: "https://www.youtube.com/watch?v=example2",
      category: "Vídeo",
      order: 2,
      active: 1,
    },
    {
      title: "Luciano Digiampietri - Ciência de dados",
      description: "Canal dedicado ao compartilhamento de videoaulas sobre computação e ciência de dados",
      link: "https://www.youtube.com/@LucianoDigiampietri",
      category: "Canal",
      order: 3,
      active: 1,
    },
    {
      title: "PapayaNews: Principais novidades da Semana",
      description: "Foco especial: Google puxa a nova fronteira da IA generativa",
      link: "https://papayanews.substack.com",
      category: "Newsletter",
      order: 4,
      active: 1,
    },
  ];

  for (const content of contents) {
    await db.insert(featuredContent).values(content);
    console.log(`✅ Conteúdo adicionado: ${content.title}`);
  }

  // Eventos de exemplo
  const sampleEvents = [
    {
      title: "Workshop: IA Generativa na Prática",
      description: "Aprenda a implementar modelos de IA generativa em seus projetos. Workshop hands-on com cases reais.",
      eventDate: new Date("2025-02-15T19:00:00"),
      location: "Online via Zoom",
      link: "https://papayanews.substack.com/events",
      active: 1,
    },
    {
      title: "Meetup PapayaNews - Networking & Inovação",
      description: "Encontro presencial da comunidade para networking, troca de experiências e discussões sobre o futuro da tecnologia.",
      eventDate: new Date("2025-03-01T18:30:00"),
      location: "São Paulo - SP",
      link: "https://papayanews.substack.com/events",
      active: 1,
    },
  ];

  for (const event of sampleEvents) {
    await db.insert(events).values(event);
    console.log(`✅ Evento adicionado: ${event.title}`);
  }

  console.log("🎉 Banco de dados populado com sucesso!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Erro ao popular banco de dados:", error);
  process.exit(1);
});
