// Manual test to trigger order creation from a paid payment order
const fetch = require('node-fetch');

async function testOrderCreation() {
  try {
    console.log('🔍 Testing order creation from paid payment order...\n');
    
    // Simulate admin approving a payment
    const paymentOrders = [
      'PO1777646930565COIG',  // One with cart items
      'PO1777646930566OBG9',  // Another with cart items
    ];
    
    for (const orderId of paymentOrders) {
      console.log(`\n📋 Testing with payment order: ${orderId}`);
      console.log('Making PATCH request to /api/admin/payments/' + orderId);
      
      try {
        const response = await fetch(`http://localhost:3000/api/admin/payments/${orderId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'paid' }),
        });
        
        const result = await response.json();
        console.log('✅ Response:', result);
        
        if (result.success) {
          console.log('✓ Payment marked as paid');
        } else {
          console.log('❌ Error:', result.error);
        }
      } catch (error) {
        console.error('❌ Request failed:', error.message);
      }
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n✅ Test complete. Check database for new orders.');
  } catch (error) {
    console.error('❌ Test error:', error);
    process.exit(1);
  }
}

testOrderCreation();
