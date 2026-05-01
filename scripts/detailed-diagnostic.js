// More detailed diagnostic of actual data in database
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '12345678',
  database: 'pooja_enterprise',
});

async function diagnose() {
  let conn;
  try {
    conn = await pool.getConnection();
    
    console.log('🔍 Detailed Data Diagnostic\n');
    
    // Get the raw payment orders
    const [rows] = await conn.execute(`
      SELECT 
        id,
        order_id,
        client_id,
        amount,
        status,
        SUBSTR(cart_items, 1, 50) as cart_items_preview,
        SUBSTR(shipping_info, 1, 50) as shipping_info_preview
      FROM payment_orders 
      WHERE cart_items IS NOT NULL OR shipping_info IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    console.log(`Showing first 5 payment orders with data:\n`);
    
    for (const row of rows) {
      console.log(`Order: ${row.order_id}`);
      console.log(`  cart_items preview: ${row.cart_items_preview}`);
      console.log(`  shipping_info preview: ${row.shipping_info_preview}`);
      console.log();
    }
    
    // Try to parse one to see what happens
    if (rows.length > 0) {
      console.log('Attempting to parse first payment order...\n');
      const [fullData] = await conn.execute(
        'SELECT cart_items, shipping_info FROM payment_orders WHERE id = ?',
        [rows[0].id]
      );
      
      const record = fullData[0];
      console.log('Full cart_items:', record.cart_items);
      console.log('Full shipping_info:', record.shipping_info);
      console.log();
      
      try {
        if (record.cart_items) {
          const parsed = JSON.parse(record.cart_items);
          console.log('✅ cart_items parsed:', parsed);
        }
      } catch (e) {
        console.log('❌ Failed to parse cart_items:', e.message);
      }
      
      try {
        if (record.shipping_info) {
          const parsed = JSON.parse(record.shipping_info);
          console.log('✅ shipping_info parsed:', parsed);
        }
      } catch (e) {
        console.log('❌ Failed to parse shipping_info:', e.message);
      }
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

diagnose();
