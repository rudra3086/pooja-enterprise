const mysql = require('mysql2/promise');
const bcryptjs = require('bcryptjs');

async function addAdmin() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'pooja_enterprise',
  });

  try {
    const password = 'newadmin2026';
    const passwordHash = bcryptjs.hashSync(password, 10);
    
    const [result] = await connection.execute(
      `INSERT INTO admins (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)`,
      [
        'admin-3',
        'newadmin@poojaenterprise.com',
        passwordHash,
        'New Admin',
        'admin'
      ]
    );

    console.log('✅ New admin account created successfully!');
    console.log('\n📧 Email: newadmin@poojaenterprise.com');
    console.log('🔑 Password: newadmin2026');
    console.log('👤 Role: admin\n');
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('⚠️  Admin account already exists!');
      console.log('\n📧 Email: newadmin@poojaenterprise.com');
      console.log('🔑 Password: newadmin2026');
      console.log('👤 Role: admin\n');
    } else {
      console.error('❌ Error creating admin:', error.message);
    }
  } finally {
    await connection.end();
  }
}

addAdmin();

