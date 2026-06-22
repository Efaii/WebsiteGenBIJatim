
const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection("mysql://root:@localhost:3306/genbi_jatim");
  const [rows] = await connection.execute("SELECT id, name FROM organization_profiles WHERE slug = 'pens'");
  console.log(JSON.stringify(rows));
  await connection.end();
}

main().catch(console.error);
