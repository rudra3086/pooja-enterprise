// Simple test of order creation using native fetch
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
        p.status
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
    console.log(`  Client: ${payment.client_id}\n`);
    
    // Check if order already exists for this client
    const [existing] = await conn.execute(`
      SELECT COUNT(*) as count FROM orders WHERE client_id = ?
    `, [payment.client_id]);
    
    console.log(`Orders already for this client: ${existing[0].count}\n`);
    
    // Make HTTP request
    console.log('🚀 Making PATCH request to trigger order creation...\n');
    
    try {
      const response = await fetch(`http://localhost:3000/api/admin/payments/${payment.order_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' })
      });
      
      const data = await response.json();
      console.log('Response status:', response.status);
      console.log('Response body:', data);
      console.log();
      
      // Wait a moment for async order creation
      console.log('⏳ Waiting 3 seconds for order to be created...\n');
      await new Promise(r => setTimeout(r, 3000));
      
      // Check if order was created
      const [newOrders] = await conn.execute(`
        SELECT id, order_number FROM orders WHERE client_id = ? ORDER BY created_at DESC LIMIT 1
      `, [payment.client_id]);
      
      if (newOrders.length > 0 && existing[0].count === 0) {
        console.log(`✅ SUCCESS! Order created for client:`);
        console.log(`  Order ID: ${newOrders[0].id}`);
        console.log(`  Order Number: ${newOrders[0].order_number}`);
      } else if (newOrders.length > 0) {
        console.log(`⚠️  Order exists but might not be the one just created`);
      } else {
        console.log(`❌ No order created for this client`);
      }
      
    } catch (error) {
      console.log('❌ Error making request:', error.message);
    }
    
  } catch (err) {
    console.error('❌ Database error:', err.message);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

testOrderCreation();
