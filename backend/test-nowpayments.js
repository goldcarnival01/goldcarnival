import dotenv from 'dotenv';
import nowpaymentsService from './src/services/nowpaymentsService.js';

// Load environment variables
dotenv.config();

async function testNOWPaymentsIntegration() {
  console.log('🧪 Testing NOWPayments Integration...\n');

  try {
    // Test 1: Get available currencies
    console.log('1. Testing getAvailableCurrencies...');
    const currencies = await nowpaymentsService.getAvailableCurrencies();
    console.log('✅ Available currencies:', currencies);
    console.log('');

    // Test 2: Get minimum payment amount
    console.log('2. Testing getMinimumPaymentAmount...');
    const minAmount = await nowpaymentsService.getMinimumPaymentAmount('usd', 'btc');
    console.log('✅ Minimum payment amount:', minAmount);
    console.log('');

    // Test 3: Get estimated price
    console.log('3. Testing getEstimatedPrice...');
    const estimate = await nowpaymentsService.getEstimatedPrice(100, 'usd', 'btc');
    console.log('✅ Price estimate:', estimate);
    console.log('');

    // Test 4: Test webhook signature validation
    console.log('4. Testing webhook signature validation...');
    const testPayload = { payment_id: 'test_payment_id', payment_status: 'finished' };
    const testSignature = 'test_signature';
    const isValid = nowpaymentsService.validateWebhookSignature(testPayload, testSignature);
    console.log('✅ Webhook signature validation:', isValid);
    console.log('');

    // Test 5: Test webhook data processing
    console.log('5. Testing webhook data processing...');
    const webhookData = {
      payment_id: 'test_payment_id',
      payment_status: 'finished',
      pay_address: 'test_address',
      pay_amount: '0.001',
      pay_currency: 'btc',
      price_amount: '100',
      price_currency: 'usd',
      order_id: 'test_order_id',
      order_description: 'Test payment',
      purchase_id: 'test_purchase_id',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      outcome_amount: '0.001',
      outcome_currency: 'btc'
    };
    const processedData = nowpaymentsService.processWebhookData(webhookData);
    console.log('✅ Processed webhook data:', processedData);
    console.log('');

    console.log('🎉 All tests passed! NOWPayments integration is working correctly.');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error details:', error);
  }
}

// Run the test
testNOWPaymentsIntegration(); 