import { drizzle } from 'drizzle-orm/mysql2';
import { badges } from './drizzle/schema.ts';

const db = drizzle(process.env.DATABASE_URL);

const initialBadges = [
  {
    name: 'Iniciante',
    description: 'Bem-vindo à comunidade PapayaNews!',
    icon: '🌱',
    pointsRequired: 0,
    color: 'green',
  },
  {
    name: 'Curioso',
    description: 'Explorou 5 conteúdos',
    icon: '🔍',
    pointsRequired: 50,
    color: 'blue',
  },
  {
    name: 'Ativo',
    description: 'Participou de discussões',
    icon: '💬',
    pointsRequired: 100,
    color: 'purple',
  },
  {
    name: 'Engajado',
    description: 'Membro ativo da comunidade',
    icon: '⭐',
    pointsRequired: 250,
    color: 'yellow',
  },
  {
    name: 'Expert',
    description: 'Referência em inovação e IA',
    icon: '🏆',
    pointsRequired: 500,
    color: 'gold',
  },
  {
    name: 'Líder',
    description: 'Inspiração para a comunidade',
    icon: '👑',
    pointsRequired: 1000,
    color: 'orange',
  },
];

async function seed() {
  console.log('🎖️ Populando badges iniciais...');
  
  for (const badge of initialBadges) {
    await db.insert(badges).values(badge);
    console.log(`✅ Badge criado: ${badge.icon} ${badge.name}`);
  }
  
  console.log('🎉 Badges criados com sucesso!');
  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Erro ao criar badges:', error);
  process.exit(1);
});
