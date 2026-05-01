// Script to verify payment_orders table structure
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '12345678',
  database: 'pooja_enterprise',
});

async function verifySchema() {
  let conn;
  try {
    conn = await pool.getConnection();
    
    console.log('Checking payment_orders table structure...\n');
    
    // Get table structure
    const [columns] = await conn.execute(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'payment_orders' AND TABLE_SCHEMA = 'pooja_enterprise'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('Columns in payment_orders table:');
    columns.forEach((col, i) => {
      console.log(`  ${i + 1}. ${col.COLUMN_NAME} - ${col.COLUMN_TYPE} (Nullable: ${col.IS_NULLABLE}, Key: ${col.COLUMN_KEY || 'None'})`);
    });
    
    // Check if cart_items and shipping_info columns exist
    const hasCartItems = columns.some(c => c.COLUMN_NAME === 'cart_items');
    const hasShippingInfo = columns.some(c => c.COLUMN_NAME === 'shipping_info');
    
    console.log('\n✓ cart_items column exists:', hasCartItems ? '✅' : '❌');
    console.log('✓ shipping_info column exists:', hasShippingInfo ? '✅' : '❌');
    
    if (!hasCartItems || !hasShippingInfo) {
      console.log('\n⚠️  Migration not applied! Running migration now...');
      
      if (!hasCartItems) {
        console.log('Adding cart_items column...');
        await conn.execute(
          `ALTER TABLE payment_orders ADD COLUMN cart_items JSON DEFAULT NULL COMMENT 'Array of cart items for order'`
        );
        console.log('✓ Added cart_items column');
      }
      
      if (!hasShippingInfo) {
        console.log('Adding shipping_info column...');
        await conn.execute(
          `ALTER TABLE payment_orders ADD COLUMN shipping_info JSON DEFAULT NULL COMMENT 'Shipping and order metadata'`
        );
        console.log('✓ Added shipping_info column');
      }
      
      console.log('\n✅ Migration completed successfully!');
    } else {
      console.log('\n✅ All required columns exist!');
    }
    
    // Sample payment order to verify data structure
    console.log('\nSample payment orders:');
    const [payments] = await conn.execute(`
      SELECT id, order_id, client_id, amount, status, 
             CASE WHEN cart_items IS NOT NULL THEN 'Yes' ELSE 'No' END as has_cart_items,
             CASE WHEN shipping_info IS NOT NULL THEN 'Yes' ELSE 'No' END as has_shipping_info
      FROM payment_orders 
      LIMIT 5
    `);
    
    if (payments.length === 0) {
      console.log('  No payment orders found');
    } else {
      payments.forEach(p => {
        console.log(`  Order: ${p.order_id} | Status: ${p.status} | Cart Items: ${p.has_cart_items} | Shipping Info: ${p.has_shipping_info}`);
      });
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

verifySchema();
