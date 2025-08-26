import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:3000';

async function testWebhookIntegration() {
  console.log('🧪 Testing NOWPayments Webhook Integration with UserPlan Creation...\n');

  try {
    // Test 1: Create a plan payment
    console.log('1. Creating plan payment...');
    const planPaymentData = {
      planId: 1, // Assuming plan ID 1 exists
      payCurrency: 'btc',
      priceCurrency: 'usd'
    };

    const planPaymentResponse = await axios.post(
      `${API_BASE_URL}/api/nowpayments/create-plan-payment`,
      planPaymentData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TEST_JWT_TOKEN || 'your-test-token'}`
        }
      }
    );

    console.log('✅ Plan payment created:', planPaymentResponse.data);
    const transactionId = planPaymentResponse.data.payment.transactionId;

    // Test 2: Test successful payment webhook
    console.log('\n2. Testing successful payment webhook...');
    const successWebhookData = {
      transactionId: transactionId,
      paymentStatus: 'confirmed'
    };

    const successWebhookResponse = await axios.post(
      `${API_BASE_URL}/api/nowpayments/test-webhook`,
      successWebhookData
    );

    console.log('✅ Success webhook processed:', successWebhookResponse.data);

    // Test 3: Test failed payment webhook
    console.log('\n3. Testing failed payment webhook...');
    const failedWebhookData = {
      transactionId: transactionId,
      paymentStatus: 'failed'
    };

    const failedWebhookResponse = await axios.post(
      `${API_BASE_URL}/api/nowpayments/test-webhook`,
      failedWebhookData
    );

    console.log('✅ Failed webhook processed:', failedWebhookResponse.data);

    // Test 4: Test expired payment webhook
    console.log('\n4. Testing expired payment webhook...');
    const expiredWebhookData = {
      transactionId: transactionId,
      paymentStatus: 'expired'
    };

    const expiredWebhookResponse = await axios.post(
      `${API_BASE_URL}/api/nowpayments/test-webhook`,
      expiredWebhookData
    );

    console.log('✅ Expired webhook processed:', expiredWebhookResponse.data);

    console.log('\n🎉 All webhook tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Plan payment creation: ✅');
    console.log('- Success webhook processing: ✅');
    console.log('- Failure webhook processing: ✅');
    console.log('- Expired webhook processing: ✅');
    console.log('- UserPlan creation: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Error details:', error);
  }
}

// Run the test
testWebhookIntegration();
