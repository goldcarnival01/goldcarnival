import React, { useState, useEffect } from 'react';
import { nowpaymentsAPI } from '../services/api';

interface NOWPaymentsButtonProps {
  invoiceId: string;
  style?: 'white' | 'black';
  className?: string;
  onPaymentClick?: (paymentUrl: string) => void;
  onError?: (error: string) => void;
}

interface PaymentButtonData {
  invoiceId: string;
  buttonStyle: string;
  paymentUrl: string;
  buttonImage: string;
  buttonAlt: string;
}

const NOWPaymentsButton: React.FC<NOWPaymentsButtonProps> = ({
  invoiceId,
  style = 'white',
  className = '',
  onPaymentClick,
  onError
}) => {
  const [buttonData, setButtonData] = useState<PaymentButtonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchButtonData = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching payment button for invoice:', invoiceId, 'style:', style);
        const response = await nowpaymentsAPI.getPaymentButton(invoiceId, style);
        console.log('✅ Payment button data received:', response.data);
        setButtonData(response.data.buttonData);
        setError(null);
      } catch (err: any) {
        console.error('❌ Payment button error:', err);
        const errorMessage = err.response?.data?.message || 'Failed to load payment button';
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      fetchButtonData();
    }
  }, [invoiceId, style, onError]);

  const handlePaymentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (buttonData?.paymentUrl) {
      onPaymentClick?.(buttonData.paymentUrl);
      // Open payment URL in new tab
      window.open(buttonData.paymentUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className={`nowpayments-button-loading ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-600">Loading payment button...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`nowpayments-button-error ${className}`}>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  if (!buttonData) {
    return null;
  }

  return (
    <div className={`nowpayments-button ${className}`}>
      <a
        href={buttonData.paymentUrl}
        target="_blank"
        rel="noreferrer noopener"
        onClick={handlePaymentClick}
        className="inline-block transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <img
          src={buttonData.buttonImage}
          alt={buttonData.buttonAlt}
          className="h-auto max-w-full"
          style={{ maxHeight: '60px' }}
        />
      </a>
    </div>
  );
};

export default NOWPaymentsButton; 