// Script to clear all data from the database
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '12345678',
  database: 'pooja_enterprise',
});

async function clearDatabase() {
  let conn;
  try {
    conn = await pool.getConnection();
    
    console.log('Starting database clear...');
    
    // Disable foreign key checks
    await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
    console.log('✓ Disabled foreign key checks');
    
    // Truncate all tables
    const tables = [
      'delivery_settings',
      'contact_messages',
      'order_items',
      'orders',
      'cart_items',
      'carts',
      'product_variants',
      'products',
      'categories',
      'password_resets',
      'clients',
      'admins',
      'sessions',
      'payment_orders'
    ];
    
    for (const table of tables) {
      try {
        await conn.execute(`TRUNCATE TABLE ${table}`);
        console.log(`✓ Truncated ${table}`);
      } catch (err) {
        // Table might not exist, continue
        console.log(`⚠ ${table} - ${err.message}`);
      }
    }
    
    // Re-enable foreign key checks
    await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✓ Re-enabled foreign key checks');
    
    console.log('\n✅ Database cleared successfully!');
  } catch (err) {
    console.error('❌ Error clearing database:', err.message);
    process.exit(1);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

clearDatabase();
