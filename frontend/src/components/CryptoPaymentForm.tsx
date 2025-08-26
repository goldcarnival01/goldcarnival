import React, { useState, useEffect } from 'react';
import { walletAPI, nowpaymentsAPI } from '../services/api';

interface CryptoPaymentFormProps {
  onPaymentSuccess?: (paymentData: any) => void;
  onPaymentError?: (error: string) => void;
  className?: string;
}


interface Currency {
  currencies: string[];
}

interface Estimate {
  currency_from: string;
  currency_to: string;
  amount_from: string;
  amount_to: string;
}

const CryptoPaymentForm: React.FC<CryptoPaymentFormProps> = ({
  onPaymentSuccess,
  onPaymentError,
  className = ''
}) => {
  const [amount, setAmount] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('btc');
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [showPaymentButton, setShowPaymentButton] = useState(false);

  // Load available currencies
  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const response = await walletAPI.getCryptoCurrencies();
        setCurrencies(response.data.currencies.currencies || []);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to load currencies';
        setError(errorMessage);
        onPaymentError?.(errorMessage);
      }
    };

    loadCurrencies();
  }, [onPaymentError]);

  // Get price estimate when amount or currency changes
  useEffect(() => {
    const getEstimate = async () => {
      if (amount && parseFloat(amount) > 0 && selectedCurrency) {
        try {
          const response = await walletAPI.getEstimatePrice({
            amount: parseFloat(amount),
            currencyFrom: 'usd',
            currencyTo: selectedCurrency
          });
          setEstimate(response.data.estimate);
        } catch (err: any) {
          console.error('Failed to get estimate:', err);
        }
      }
    };

    const timeoutId = setTimeout(getEstimate, 500);
    return () => clearTimeout(timeoutId);
  }, [amount, selectedCurrency]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || parseFloat(value) >= 0) {
      setAmount(value);
    }
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCurrency(e.target.value);
  };

  const handleCreatePayment = async () => {
    if (!amount || parseFloat(amount) < 1) {
      setError('Amount must be at least $1');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await walletAPI.deposit({
        amount: parseFloat(amount),
        payCurrency: selectedCurrency,
        priceCurrency: 'usd'
      });

      setPaymentData(response.data.payment);
      setShowPaymentButton(true);
      onPaymentSuccess?.(response.data.payment);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create payment';
      setError(errorMessage);
      onPaymentError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClick = (paymentUrl: string) => {
    console.log('Payment URL clicked:', paymentUrl);
    // You can add additional tracking or analytics here
  };

  const handlePaymentError = (error: string) => {
    setError(error);
    onPaymentError?.(error);
  };

  return (
    <div className={`crypto-payment-form ${className}`}>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Crypto Payment</h2>
        
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Amount Input */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount (USD)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
              min="1"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter amount in USD"
            />
          </div>

          {/* Currency Selection */}
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
              Cryptocurrency
            </label>
            <select
              id="currency"
              value={selectedCurrency}
              onChange={handleCurrencyChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Price Estimate */}
          {estimate && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Price Estimate</h3>
              <div className="text-sm text-blue-800">
                <p>You will pay: <strong>{estimate.amount_to} {estimate.currency_to.toUpperCase()}</strong></p>
                <p>Rate: 1 USD = {parseFloat(estimate.amount_to) / parseFloat(estimate.amount_from)} {estimate.currency_to.toUpperCase()}</p>
              </div>
            </div>
          )}

          {/* Create Payment Button */}
          {!showPaymentButton && (
            <button
              onClick={handleCreatePayment}
              disabled={loading || !amount || parseFloat(amount) < 1}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Payment...' : 'Create Payment'}
            </button>
          )}

                     {/* Payment Button */}
           {showPaymentButton && paymentData && (
             <div className="border-t pt-4">
               <h3 className="text-lg font-medium text-gray-900 mb-4">Complete Payment</h3>
               <div className="text-center">
                 <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                   <h4 className="text-sm font-medium text-green-900 mb-2">Payment Details</h4>
                   <div className="text-sm text-green-800 space-y-1">
                     <p><strong>Amount:</strong> {paymentData.priceAmount} {paymentData.priceCurrency.toUpperCase()}</p>
                     <p><strong>Crypto Amount:</strong> {paymentData.payAmount} {paymentData.payCurrency.toUpperCase()}</p>
                     <p><strong>Status:</strong> {paymentData.status}</p>
                   </div>
                 </div>
                 
                 <div className="mb-4">
                   <a
                     href={paymentData.paymentUrl}
                     target="_blank"
                     rel="noopener noreferrer"
                     onClick={() => handlePaymentClick(paymentData.paymentUrl)}
                     className="inline-block bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                   >
                     <img 
                       src="https://nowpayments.io/images/embeds/payment-button-white.svg" 
                       alt="Cryptocurrency & Bitcoin payment button by NOWPayments"
                       className="h-12"
                     />
                   </a>
                 </div>
                 
                 <div className="text-xs text-gray-500 mt-4">
                   <p>Click the button above to complete your payment</p>
                   <p>You'll be redirected to NOWPayments secure payment page</p>
                 </div>
                 
                 <div className="mt-4 text-center">
                   <button
                     onClick={() => {
                       setShowPaymentButton(false);
                       setPaymentData(null);
                       setAmount('');
                     }}
                     className="text-sm text-gray-600 hover:text-gray-800 underline"
                   >
                     Create New Payment
                   </button>
                 </div>
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default CryptoPaymentForm; 