// Direct test of order creation logic without HTTP
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '12345678',
  database: 'pooja_enterprise',
});

async function testDirectOrderCreation() {
  let conn;
  try {
    conn = await pool.getConnection();
    
    console.log('🧪 Direct Test of Order Creation Logic\n');
    
    // Get a paid payment order with cart items and shipping info
    const [payments] = await conn.execute(`
      SELECT 
        p.id,
        p.order_id,
        p.client_id,
        p.amount,
        p.status,
        p.cart_items,
        p.shipping_info
      FROM payment_orders p
      WHERE p.status = 'paid' 
      AND p.cart_items IS NOT NULL 
      AND p.shipping_info IS NOT NULL
      ORDER BY p.created_at DESC
      LIMIT 1
    `);
    
    if (payments.length === 0) {
      console.log('❌ No suitable paid payment found');
      return;
    }
    
    const payment = payments[0];
    console.log('Found test payment:');
    console.log(`  ID: ${payment.id}`);
    console.log(`  Order ID: ${payment.order_id}`);
    console.log(`  Status: ${payment.status}`);
    console.log(`  Amount: ₹${payment.amount}`);
    console.log(`  Client: ${payment.client_id}\n`);
    
    // Parse cart and shipping
    console.log('Parsing cart items and shipping info...\n');
    
    let cartItems = [];
    let shippingInfo = {};
    
    // Handle mysql2 JSON column behavior
    if (payment.cart_items) {
      if (Array.isArray(payment.cart_items)) {
        cartItems = payment.cart_items;
        console.log(`✅ Cart items (array): ${cartItems.length} items`);
      } else if (typeof payment.cart_items === 'string') {
        cartItems = JSON.parse(payment.cart_items);
        console.log(`✅ Cart items (parsed string): ${cartItems.length} items`);
      } else {
        console.log('❌ Unexpected cart_items type:', typeof payment.cart_items);
      }
    }
    
    if (payment.shipping_info) {
      if (typeof payment.shipping_info === 'object' && !Array.isArray(payment.shipping_info)) {
        shippingInfo = payment.shipping_info;
        console.log(`✅ Shipping info (object): ${Object.keys(shippingInfo).length} fields`);
      } else if (typeof payment.shipping_info === 'string') {
        shippingInfo = JSON.parse(payment.shipping_info);
        console.log(`✅ Shipping info (parsed string): ${Object.keys(shippingInfo).length} fields`);
      } else {
        console.log('❌ Unexpected shipping_info type:', typeof payment.shipping_info);
      }
    }
    
    if (cartItems.length === 0) {
      console.log('\n❌ No cart items found');
      return;
    }
    
    // Simulate order creation
    console.log('\nSimulating order creation...\n');
    
    const orderNumber = `PE-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('Would create order:');
    console.log(`  Order ID: ${orderId}`);
    console.log(`  Order Number: ${orderNumber}`);
    console.log(`  Client: ${payment.client_id}`);
    console.log(`  Amount: ₹${payment.amount}`);
    console.log(`  Items: ${cartItems.length}`);
    console.log(`  Shipping: ${shippingInfo.shippingName} (${shippingInfo.shippingCity})`);
    console.log();
    
    // Actually create the order
    console.log('Attempting to create order in database...\n');
    
    try {
      await conn.beginTransaction();
      
      // Insert order
      const [result] = await conn.execute(
        `INSERT INTO orders (
          id, client_id, order_number, status, payment_status, payment_method,
          subtotal, tax_amount, shipping_amount, discount_amount, total_amount,
          shipping_name, shipping_phone, shipping_address_line1,
          shipping_city, shipping_state, shipping_postal_code, shipping_country,
          requires_shipping, customer_notes
        ) VALUES (?, ?, ?, 'pending', 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'India', ?, ?)`,
        [
          orderId,
          payment.client_id,
          orderNumber,
          shippingInfo.paymentMethod || 'upi',
          shippingInfo.subtotal || 0,
          shippingInfo.taxAmount || 0,
          shippingInfo.shippingAmount || 0,
          shippingInfo.discountAmount || 0,
          payment.amount,
          shippingInfo.shippingName || '',
          shippingInfo.shippingPhone || '',
          shippingInfo.shippingAddressLine1 || '',
          shippingInfo.shippingCity || '',
          shippingInfo.shippingState || '',
          shippingInfo.shippingPostalCode || '',
          shippingInfo.requiresShipping !== false,
          shippingInfo.customerNotes || ''
        ]
      );
      
      console.log(`✅ Order row inserted: ${result.insertId}`);
      
      // Insert order items
      for (const item of cartItems) {
        const itemId = `oi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        let customizationJson = null;
        if (item.customization) {
          if (typeof item.customization === 'string') {
            customizationJson = item.customization;
          } else {
            customizationJson = JSON.stringify(item.customization);
          }
        }
        
        await conn.execute(
          `INSERT INTO order_items (
            id, order_id, product_id, variant_id, product_name,
            quantity, unit_price, total_price, customization
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            itemId,
            orderId,
            item.productId,
            item.variantId || null,
            item.productName || 'Product',
            item.quantity,
            item.unitPrice,
            item.totalPrice,
            customizationJson
          ]
        );
        
        console.log(`  ✅ Item inserted: ${item.productName} x ${item.quantity}`);
      }
      
      await conn.commit();
      console.log(`\n✅ SUCCESS! Order created and committed`);
      
      // Verify it exists
      const [verify] = await conn.execute('SELECT * FROM orders WHERE id = ?', [orderId]);
      if (verify.length > 0) {
        console.log('✅ Verified: Order exists in database');
      }
      
    } catch (error) {
      await conn.rollback();
      console.error('❌ Error creating order:', error.message);
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

testDirectOrderCreation();
