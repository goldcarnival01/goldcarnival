import React, { useState } from 'react';
import CryptoPaymentForm from '../components/CryptoPaymentForm';
import NOWPaymentsButton from '../components/NOWPaymentsButton';

const CryptoPaymentTestPage: React.FC = () => {
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handlePaymentSuccess = (paymentData: any) => {
    setPaymentSuccess(paymentData);
    setPaymentError(null);
    console.log('Payment created successfully:', paymentData);
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    setPaymentSuccess(null);
    console.error('Payment error:', error);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            NOWPayments Integration Test
          </h1>
          <p className="text-gray-600">
            Test the crypto payment integration with your NOWPayments invoice
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Create New Payment
            </h2>
            <CryptoPaymentForm
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          </div>

          {/* Direct Invoice Button */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Direct Invoice Payment
            </h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-4">
                Use your existing invoice (ID: 4623807894) for 3 USDT
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">White Button</h3>
                  <div className="text-center">
                    <NOWPaymentsButton
                      invoiceId="4623807894"
                      style="white"
                      onPaymentClick={(url) => console.log('Direct payment clicked:', url)}
                      onError={handlePaymentError}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Black Button</h3>
                  <div className="text-center">
                    <NOWPaymentsButton
                      invoiceId="4623807894"
                      style="black"
                      onPaymentClick={(url) => console.log('Direct payment clicked:', url)}
                      onError={handlePaymentError}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Raw HTML</h3>
                  <div className="bg-gray-100 p-3 rounded text-xs">
                    <code>
                      {`<a href="https://nowpayments.io/payment/?iid=4623807894&source=button" target="_blank" rel="noreferrer noopener">
  <img src="https://nowpayments.io/images/embeds/payment-button-white.svg" alt="Cryptocurrency & Bitcoin payment button by NOWPayments">
</a>`}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {paymentSuccess && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-green-900 mb-2">Payment Created Successfully!</h3>
            <div className="text-sm text-green-800">
              <p><strong>Payment ID:</strong> {paymentSuccess.paymentId}</p>
              <p><strong>Amount:</strong> {paymentSuccess.priceAmount} {paymentSuccess.priceCurrency.toUpperCase()}</p>
              <p><strong>Crypto Amount:</strong> {paymentSuccess.payAmount} {paymentSuccess.payCurrency.toUpperCase()}</p>
              <p><strong>Status:</strong> {paymentSuccess.status}</p>
            </div>
          </div>
        )}

        {paymentError && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-red-900 mb-2">Payment Error</h3>
            <p className="text-sm text-red-800">{paymentError}</p>
          </div>
        )}

        {/* Integration Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">Integration Instructions</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>1. Backend Setup:</strong> The NOWPayments service is already configured with your API key.</p>
            <p><strong>2. Webhook URL:</strong> Set your webhook URL to: <code className="bg-blue-100 px-1 rounded">https://your-domain.com/api/nowpayments/webhook</code></p>
            <p><strong>3. IPN Secret:</strong> Generate and configure your IPN secret in the .env file.</p>
            <p><strong>4. Testing:</strong> Use the sandbox environment for testing, production for live payments.</p>
            <p><strong>5. Invoice ID:</strong> Your invoice ID 4623807894 can be used for direct payments.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoPaymentTestPage; 