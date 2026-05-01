// Clean up old payment orders with bad data
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '12345678',
  database: 'pooja_enterprise',
});

async function cleanup() {
  let conn;
  try {
    conn = await pool.getConnection();
    
    console.log('🧹 Cleaning up payment orders with bad JSON data...\n');
    
    // Find payment orders with "[object Object]" data
    const [badOrders] = await conn.execute(`
      SELECT id, order_id, cart_items, shipping_info
      FROM payment_orders 
      WHERE cart_items LIKE '%[object Object]%' OR shipping_info LIKE '%[object Object]%'
    `);
    
    console.log(`Found ${badOrders.length} payment orders with bad data\n`);
    
    if (badOrders.length > 0) {
      console.log('Resetting bad data to NULL...');
      
      const [result] = await conn.execute(`
        UPDATE payment_orders 
        SET cart_items = NULL, shipping_info = NULL
        WHERE cart_items LIKE '%[object Object]%' OR shipping_info LIKE '%[object Object]%'
      `);
      
      console.log(`✅ Updated ${result.affectedRows} payment orders\n`);
    }
    
    // Also delete any orders that might have been created from bad payment data
    // (orders without items)
    const [orphanOrders] = await conn.execute(`
      SELECT COUNT(*) as count 
      FROM orders o
      WHERE o.payment_method = 'upi'
      AND NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = o.id)
    `);
    
    if (orphanOrders[0].count > 0) {
      console.log(`Found ${orphanOrders[0].count} orphan orders (no items) - these may have been created from bad data`);
      console.log('Consider manually reviewing these orders');
    }
    
    console.log('\n✅ Cleanup complete!');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

cleanup();
