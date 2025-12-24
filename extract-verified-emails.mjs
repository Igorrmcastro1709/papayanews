import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

async function extractVerifiedEmails() {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  try {
    // Buscar todas as solicitações verificadas (excluindo emails de teste)
    const [verified] = await connection.execute(`
      SELECT name, email, created_at 
      FROM signup_requests 
      WHERE verified = 1 
      AND email NOT LIKE '%@papayanews.com'
      AND email NOT LIKE 'test-%'
      AND email NOT LIKE 'verify-%'
      AND email NOT LIKE 'wrong-%'
      AND email NOT LIKE 'used-%'
      AND email NOT LIKE 'db-test-%'
      ORDER BY created_at DESC
    `);
    
    console.log('\n=== EMAILS VERIFICADOS (prontos para contato) ===\n');
    console.log('Total:', verified.length, 'usuários\n');
    
    // Formato CSV para fácil importação
    console.log('--- CSV FORMAT ---');
    console.log('Nome,Email,Data Cadastro');
    verified.forEach(user => {
      const date = new Date(user.created_at).toLocaleDateString('pt-BR');
      console.log(`${user.name},${user.email},${date}`);
    });
    
    // Buscar solicitações não verificadas também (excluindo emails de teste)
    const [notVerified] = await connection.execute(`
      SELECT name, email, created_at 
      FROM signup_requests 
      WHERE verified = 0 
      AND email NOT LIKE '%@papayanews.com'
      AND email NOT LIKE 'test-%'
      AND email NOT LIKE 'verify-%'
      AND email NOT LIKE 'wrong-%'
      AND email NOT LIKE 'used-%'
      AND email NOT LIKE 'db-test-%'
      ORDER BY created_at DESC
    `);
    
    console.log('\n\n=== EMAILS NÃO VERIFICADOS (tentaram mas não completaram) ===\n');
    console.log('Total:', notVerified.length, 'usuários\n');
    
    console.log('--- CSV FORMAT ---');
    console.log('Nome,Email,Data Tentativa');
    notVerified.forEach(user => {
      const date = new Date(user.created_at).toLocaleDateString('pt-BR');
      console.log(`${user.name},${user.email},${date}`);
    });
    
  } finally {
    await connection.end();
  }
}

extractVerifiedEmails().catch(console.error);
