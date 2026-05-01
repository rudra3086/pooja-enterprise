// Comprehensive diagnostic of payment -> order flow
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
    
    console.log('🔍 PAYMENT ORDERS DIAGNOSTIC\n');
    console.log('═'.repeat(80));
    
    // 1. Check payment orders with cart items
    console.log('\n1️⃣  Payment Orders with Cart Items & Shipping Info:\n');
    const [payments] = await conn.execute(`
      SELECT 
        p.id,
        p.order_id,
        p.client_id,
        p.amount,
        p.status,
        CHAR_LENGTH(p.cart_items) as cart_items_size,
        CHAR_LENGTH(p.shipping_info) as shipping_info_size,
        CASE 
          WHEN p.cart_items IS NOT NULL AND JSON_VALID(p.cart_items) 
          THEN JSON_LENGTH(p.cart_items)
          ELSE 0
        END as cart_items_count,
        p.created_at
      FROM payment_orders p
      WHERE p.cart_items IS NOT NULL AND p.shipping_info IS NOT NULL
      ORDER BY p.created_at DESC
      LIMIT 3
    `);
    
    console.log(`Found ${payments.length} payment orders with cart/shipping data:\n`);
    
    for (const p of payments) {
      console.log(`Payment: ${p.order_id}`);
      console.log(`  ID: ${p.id}`);
      console.log(`  Status: ${p.status}`);
      console.log(`  Amount: ₹${p.amount}`);
      console.log(`  Client: ${p.client_id}`);
      console.log(`  Cart Items: ${p.cart_items_count} items (${p.cart_items_size} bytes)`);
      console.log(`  Shipping Data: ${p.shipping_info_size} bytes`);
      
      // Check if client exists
      const [client] = await conn.execute('SELECT id FROM clients WHERE id = ? LIMIT 1', [p.client_id]);
      console.log(`  Client Exists: ${client.length > 0 ? '✅' : '❌'}`);
      
      // Check if order exists for this client
      const [orders] = await conn.execute(`
        SELECT COUNT(*) as count FROM orders 
        WHERE client_id = ? AND payment_method = 'upi'
      `, [p.client_id]);
      console.log(`  Orders for this Client: ${orders[0].count}`);
      
      console.log();
    }
    
    // 2. Test parsing cart items and shipping info
    console.log('═'.repeat(80));
    console.log('\n2️⃣  Testing Data Parsing:\n');
    
    if (payments.length > 0) {
      const testPayment = payments[0];
      
      // Get full record
      const [full] = await conn.execute(`
        SELECT cart_items, shipping_info 
        FROM payment_orders 
        WHERE id = ?
      `, [testPayment.id]);
      
      const record = full[0];
      console.log(`Testing with payment: ${testPayment.order_id}\n`);
      
      try {
        const cartItems = JSON.parse(record.cart_items || '[]');
        console.log(`✅ Cart Items Parse Success: ${cartItems.length} items`);
        if (cartItems.length > 0) {
          console.log(`   First Item:`, {
            productId: cartItems[0].productId,
            quantity: cartItems[0].quantity,
            totalPrice: cartItems[0].totalPrice
          });
        }
      } catch (e) {
        console.log(`❌ Cart Items Parse Failed:`, e.message);
      }
      
      try {
        const shippingInfo = JSON.parse(record.shipping_info || '{}');
        console.log(`✅ Shipping Info Parse Success: ${Object.keys(shippingInfo).length} fields`);
        console.log(`   Amount Fields:`, {
          subtotal: shippingInfo.subtotal,
          taxAmount: shippingInfo.taxAmount,
          shippingAmount: shippingInfo.shippingAmount,
          discountAmount: shippingInfo.discountAmount
        });
      } catch (e) {
        console.log(`❌ Shipping Info Parse Failed:`, e.message);
      }
    }
    
    // 3. Check if createOrder logic would work
    console.log('\n' + '═'.repeat(80));
    console.log('\n3️⃣  Testing Order Creation Logic:\n');
    
    if (payments.length > 0) {
      const testPayment = payments[0];
      const [full] = await conn.execute(`
        SELECT cart_items, shipping_info, amount
        FROM payment_orders 
        WHERE id = ?
      `, [testPayment.id]);
      
      const record = full[0];
      const cartItems = JSON.parse(record.cart_items);
      const shippingInfo = JSON.parse(record.shipping_info);
      
      const orderData = {
        clientId: testPayment.client_id,
        orderNumber: `ORD-${Date.now()}`,
        subtotal: shippingInfo.subtotal || 0,
        taxAmount: shippingInfo.taxAmount || 0,
        shippingAmount: shippingInfo.shippingAmount || 0,
        discountAmount: shippingInfo.discountAmount || 0,
        totalAmount: record.amount,
        shippingName: shippingInfo.shippingName || '',
        shippingPhone: shippingInfo.shippingPhone || '',
        shippingAddressLine1: shippingInfo.shippingAddressLine1 || '',
        shippingCity: shippingInfo.shippingCity || '',
        shippingState: shippingInfo.shippingState || '',
        shippingPostalCode: shippingInfo.shippingPostalCode || '',
        requiresShipping: shippingInfo.requiresShipping !== false,
        paymentMethod: 'upi',
        items: cartItems
      };
      
      console.log(`Would create order with:`);
      console.log(`  Order Number: ${orderData.orderNumber}`);
      console.log(`  Total: ₹${orderData.totalAmount}`);
      console.log(`  Items: ${orderData.items.length}`);
      console.log(`  Shipping: ${orderData.shippingName} (${orderData.shippingCity})`);
      console.log(`\n✅ Order creation logic appears valid`);
    }
    
    // 4. Summary
    console.log('\n' + '═'.repeat(80));
    console.log('\n✅ DIAGNOSTIC COMPLETE\n');
    console.log('Issues Found:');
    
    // Check for issues
    const [paid] = await conn.execute(`
      SELECT COUNT(*) as count FROM payment_orders 
      WHERE status = 'paid' AND cart_items IS NOT NULL
    `);
    
    const [orders] = await conn.execute(`
      SELECT COUNT(*) as count FROM orders
    `);
    
    if (paid[0].count > 0 && orders[0].count === 0) {
      console.log('❌ Paid payment orders exist but NO orders created - workflow broken');
    } else if (paid[0].count > orders[0].count) {
      console.log('❌ Fewer orders than paid payments - not all payments being processed');
    } else {
      console.log('✅ No obvious issues detected');
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

diagnose();
