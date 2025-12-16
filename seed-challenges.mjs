import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

// Create weekly challenges
const now = new Date();
const endOfWeek = new Date(now);
endOfWeek.setDate(endOfWeek.getDate() + 7);

const challenges = [
  {
    title: "Explorador de Conteúdo",
    description: "Acesse 5 conteúdos diferentes esta semana",
    pointsReward: 50,
    targetAction: "view_content",
    targetCount: 5,
    startDate: now,
    endDate: endOfWeek,
    isActive: 1,
  },
  {
    title: "Participante Ativo",
    description: "Faça 3 comentários em conteúdos ou eventos",
    pointsReward: 75,
    targetAction: "comment",
    targetCount: 3,
    startDate: now,
    endDate: endOfWeek,
    isActive: 1,
  },
  {
    title: "Embaixador Social",
    description: "Compartilhe 2 conteúdos nas redes sociais",
    pointsReward: 100,
    targetAction: "share",
    targetCount: 2,
    startDate: now,
    endDate: endOfWeek,
    isActive: 1,
  },
];

for (const challenge of challenges) {
  await connection.execute(
    `INSERT INTO weekly_challenges (title, description, pointsReward, targetAction, targetCount, startDate, endDate, isActive, createdAt) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [challenge.title, challenge.description, challenge.pointsReward, challenge.targetAction, challenge.targetCount, challenge.startDate, challenge.endDate, challenge.isActive]
  );
}

console.log("✅ Desafios semanais criados com sucesso!");
await connection.end();
