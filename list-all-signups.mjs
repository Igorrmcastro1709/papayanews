import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

async function listAllSignups() {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  try {
    // Buscar TODAS as solicitações de cadastro
    const [all] = await connection.execute(`
      SELECT name, email, verified, created_at 
      FROM signup_requests 
      ORDER BY created_at DESC
    `);
    
    console.log('\n=== TODAS AS SOLICITAÇÕES DE CADASTRO ===\n');
    console.log('Total:', all.length, 'solicitações\n');
    
    // Separar emails reais de emails de teste
    const testEmails = all.filter(r => 
      r.email.includes('@papayanews.com') || 
      r.email.startsWith('test-') ||
      r.email.startsWith('verify-') ||
      r.email.startsWith('wrong-') ||
      r.email.startsWith('used-') ||
      r.email.startsWith('db-test-')
    );
    
    const realEmails = all.filter(r => 
      !r.email.includes('@papayanews.com') && 
      !r.email.startsWith('test-') &&
      !r.email.startsWith('verify-') &&
      !r.email.startsWith('wrong-') &&
      !r.email.startsWith('used-') &&
      !r.email.startsWith('db-test-')
    );
    
    console.log('--- EMAILS REAIS (pessoas que tentaram se cadastrar) ---');
    console.log('Total:', realEmails.length);
    if (realEmails.length > 0) {
      console.log('\nNome,Email,Verificado,Data');
      realEmails.forEach(r => {
        const date = new Date(r.created_at).toLocaleDateString('pt-BR');
        const verified = r.verified ? 'Sim' : 'Não';
        console.log(`${r.name},${r.email},${verified},${date}`);
      });
    } else {
      console.log('Nenhum email real encontrado.');
    }
    
    console.log('\n--- EMAILS DE TESTE AUTOMATIZADO ---');
    console.log('Total:', testEmails.length);
    
    // Também verificar usuários cadastrados
    const [users] = await connection.execute(`
      SELECT id, name, email 
      FROM users 
      ORDER BY id DESC
    `);
    
    console.log('\n\n=== USUÁRIOS CADASTRADOS (com conta ativa) ===\n');
    console.log('Total:', users.length, 'usuários\n');
    console.log('ID,Nome,Email');
    users.forEach(u => {
      console.log(`${u.id},${u.name},${u.email}`);
    });
    
  } finally {
    await connection.end();
  }
}

listAllSignups().catch(console.error);
