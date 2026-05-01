// Direct test of createOrderFromPaymentOrder function
const db = require('./lib/db.ts');

async function testOrderCreation() {
  try {
    console.log('🔍 Testing createOrderFromPaymentOrder directly...\n');
    
    // Get a payment order with cart items and client
    const paymentOrders = await db.getPaymentOrders();
    
    const testPayment = paymentOrders.find(p => 
      p.cartItems && p.cartItems.length > 0 && p.clientId
    );
    
    if (!testPayment) {
      console.log('❌ No suitable test payment order found');
      return;
    }
    
    console.log('Found test payment order:', {
      id: testPayment.id,
      orderId: testPayment.orderId,
      status: testPayment.status,
      clientId: testPayment.clientId,
      amount: testPayment.amount,
      cartItemsCount: testPayment.cartItems?.length || 0,
      shippingInfoExists: !!testPayment.shippingInfo
    });
    
    if (testPayment.status !== 'paid') {
      console.log('⚠️ Warning: Test payment is', testPayment.status, '(expected: paid)');
      console.log('Proceeding anyway for testing...\n');
    }
    
    console.log('📝 Calling createOrderFromPaymentOrder...\n');
    
    const order = await db.createOrderFromPaymentOrder(testPayment.id, testPayment.clientId);
    
    if (order) {
      console.log('✅ Order created successfully!');
      console.log('Order details:', {
        id: order.id,
        orderNumber: order.orderNumber,
        clientId: order.clientId,
        status: order.status,
        totalAmount: order.totalAmount,
        itemCount: order.items?.length || 0
      });
    } else {
      console.log('❌ createOrderFromPaymentOrder returned null');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testOrderCreation();
