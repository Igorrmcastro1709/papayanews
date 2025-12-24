import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

async function checkSignups() {
  const url = new URL(DATABASE_URL);
  
  const connection = await mysql.createConnection({
    host: url.hostname,
    port: parseInt(url.port) || 4000,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    ssl: { rejectUnauthorized: true }
  });

  console.log('\n=== USUÁRIOS CADASTRADOS ===');
  const [users] = await connection.execute('SELECT id, name, email, role FROM users ORDER BY id DESC');
  console.log(`Total: ${users.length} usuários`);
  users.forEach(u => console.log(`  - ${u.name} (${u.email}) - ${u.role}`));

  console.log('\n=== SOLICITAÇÕES DE CADASTRO ===');
  const [stats] = await connection.execute('SELECT verified, COUNT(*) as total FROM signup_requests GROUP BY verified');
  stats.forEach(s => console.log(`  - Verified=${s.verified}: ${s.total} solicitações`));

  console.log('\n=== SOLICITAÇÕES REAIS (não de teste) ===');
  const [requests] = await connection.execute("SELECT id, name, email, verified, created_at FROM signup_requests WHERE email NOT LIKE '%papayanews.com' ORDER BY created_at DESC LIMIT 30");
  requests.forEach(r => console.log(`  - ${r.name} (${r.email}) - verified: ${r.verified} - ${r.created_at}`));

  await connection.end();
}

checkSignups().catch(console.error);
