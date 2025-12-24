import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

async function checkConnections() {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  try {
    // Ver todos os usuários
    const [users] = await connection.execute('SELECT id, name FROM users');
    console.log('\n=== USUÁRIOS ===');
    users.forEach(u => console.log(`ID: ${u.id}, Nome: ${u.name}`));
    
    // Ver todas as conexões
    const [connections] = await connection.execute(`
      SELECT c.id, c.requester_id, c.receiver_id, c.status, c.created_at,
             u1.name as requester_name, u2.name as receiver_name
      FROM user_connections c 
      LEFT JOIN users u1 ON c.requester_id = u1.id 
      LEFT JOIN users u2 ON c.receiver_id = u2.id
    `);
    
    console.log('\n=== CONEXÕES ===');
    connections.forEach(c => {
      console.log(`ID: ${c.id}`);
      console.log(`  Solicitante: ${c.requester_name} (ID: ${c.requester_id})`);
      console.log(`  Receptor: ${c.receiver_name} (ID: ${c.receiver_id})`);
      console.log(`  Status: ${c.status}`);
      console.log(`  Data: ${c.created_at}`);
      console.log('---');
    });
    
  } finally {
    await connection.end();
  }
}

checkConnections().catch(console.error);
