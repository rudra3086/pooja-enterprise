// Check if orders were created from payment orders
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '12345678',
  database: 'pooja_enterprise',
});

async function checkOrders() {
  let conn;
  try {
    conn = await pool.getConnection();
    
    console.log('Payment Orders vs Created Orders:\n');
    
    // Get payment orders with cart data
    const [payments] = await conn.execute(`
      SELECT 
        p.id,
        p.order_id as paymentOrderId,
        p.client_id,
        p.amount,
        p.status as paymentStatus,
        CASE WHEN p.cart_items IS NOT NULL THEN 'Yes' ELSE 'No' END as has_cart_items,
        CASE WHEN p.shipping_info IS NOT NULL THEN 'Yes' ELSE 'No' END as has_shipping_info
      FROM payment_orders p
      WHERE p.cart_items IS NOT NULL AND p.shipping_info IS NOT NULL
      ORDER BY p.created_at DESC
      LIMIT 10
    `);
    
    console.log(`Found ${payments.length} payment orders with cart items and shipping info:\n`);
    
    for (const payment of payments) {
      console.log(`Payment Order: ${payment.paymentOrderId}`);
      console.log(`  Status: ${payment.paymentStatus}`);
      console.log(`  Client ID: ${payment.client_id}`);
      console.log(`  Amount: ₹${payment.amount}`);
      
      // Check if order exists for this client
      const [orders] = await conn.execute(`
        SELECT 
          o.id,
          o.order_number,
          o.status,
          o.total_amount,
          o.created_at,
          COUNT(oi.id) as item_count
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.client_id = ? AND o.payment_method = 'upi'
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT 5
      `, [payment.client_id]);
      
      if (orders.length === 0) {
        console.log(`  ❌ NO ORDER CREATED for this client`);
      } else {
        console.log(`  ✅ Orders found for this client:`);
        orders.forEach(o => {
          console.log(`     - ${o.order_number} (${o.item_count} items) - ₹${o.total_amount} - ${o.status}`);
        });
      }
      
      console.log();
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

checkOrders();
