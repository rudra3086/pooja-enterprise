// Script to migrate payment_orders table to add order details columns
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '12345678',
  database: 'pooja_enterprise',
});

async function runMigration() {
  let conn;
  try {
    conn = await pool.getConnection();
    
    console.log('Running migration: Add cart_items and shipping_info columns...\n');
    
    // Check if columns already exist
    const [columns] = await conn.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'payment_orders' AND TABLE_SCHEMA = 'pooja_enterprise'`
    );
    
    const columnNames = columns.map(c => c.COLUMN_NAME);
    
    if (!columnNames.includes('cart_items')) {
      await conn.execute(
        `ALTER TABLE payment_orders ADD COLUMN cart_items JSON DEFAULT NULL COMMENT 'Array of cart items for order'`
      );
      console.log('✓ Added cart_items column');
    } else {
      console.log('✓ cart_items column already exists');
    }
    
    if (!columnNames.includes('shipping_info')) {
      await conn.execute(
        `ALTER TABLE payment_orders ADD COLUMN shipping_info JSON DEFAULT NULL COMMENT 'Shipping and order metadata'`
      );
      console.log('✓ Added shipping_info column');
    } else {
      console.log('✓ shipping_info column already exists');
    }
    
    console.log('\n✅ Migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    process.exit(1);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

runMigration();
