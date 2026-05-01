// Test order creation from existing paid payment order
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '12345678',
  database: 'pooja_enterprise',
});

async function testOrderCreation() {
  let conn;
  try {
    conn = await pool.getConnection();
    
    console.log('🧪 Testing Order Creation from Paid Payment\n');
    
    // Get a paid payment order with cart items and shipping info
    const [payments] = await conn.execute(`
      SELECT 
        p.id,
        p.order_id,
        p.client_id,
        p.amount,
        p.status,
        CHAR_LENGTH(p.cart_items) as cart_size,
        CHAR_LENGTH(p.shipping_info) as shipping_size
      FROM payment_orders p
      WHERE p.status = 'paid' 
      AND p.cart_items IS NOT NULL 
      AND p.shipping_info IS NOT NULL
      AND CHAR_LENGTH(p.cart_items) > 5
      AND CHAR_LENGTH(p.shipping_info) > 5
      ORDER BY p.created_at DESC
      LIMIT 1
    `);
    
    if (payments.length === 0) {
      console.log('❌ No suitable paid payment found');
      return;
    }
    
    const payment = payments[0];
    console.log('Found test payment:');
    console.log(`  Order ID: ${payment.order_id}`);
    console.log(`  Status: ${payment.status}`);
    console.log(`  Amount: ₹${payment.amount}`);
    console.log(`  Cart Size: ${payment.cart_size} bytes`);
    console.log(`  Shipping Size: ${payment.shipping_size} bytes\n`);
    
    // Check if order already exists for this client
    const [existing] = await conn.execute(`
      SELECT COUNT(*) as count FROM orders WHERE client_id = ?
    `, [payment.client_id]);
    
    console.log(`Orders already for this client: ${existing[0].count}\n`);
    
    // Make HTTP request to trigger order creation
    console.log('🚀 Making request to trigger order creation...\n');
    
    const orderId = payment.order_id;
    
    // Create a simple test by directly calling the function
    // Since we can't easily use node-fetch, let's use curl
    
    const { execSync } = require('child_process');
    
    try {
      const response = execSync(`curl -X PATCH http://localhost:3000/api/admin/payments/${orderId} -H "Content-Type: application/json" -d "{\\"status\\":\\"paid\\"}" 2>/dev/null`, {
        encoding: 'utf-8'
      });
      
      console.log('Response:', response);
      console.log('\n⏳ Waiting 2 seconds for order to be created...');
      await new Promise(r => setTimeout(r, 2000));
      
      // Check if order was created
      const [newOrders] = await conn.execute(`
        SELECT COUNT(*) as count FROM orders WHERE client_id = ?
      `, [payment.client_id]);
      
      if (newOrders[0].count > existing[0].count) {
        console.log(`\n✅ SUCCESS! New order created for client (now ${newOrders[0].count} total)`);
      } else {
        console.log(`\n❌ No new order created (still ${newOrders[0].count} total)`);
      }
    } catch (error) {
      console.log('Error making request:', error.message);
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

testOrderCreation();
