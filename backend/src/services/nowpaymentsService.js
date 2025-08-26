import axios from 'axios';

class NOWPaymentsService {
  constructor() {
    this.apiKey = process.env.NOWPAYMENTS_API_KEY;
    this.baseURL = 'https://api.nowpayments.io/v1';
    this.sandboxURL = 'https://api-sandbox.nowpayments.io/v1';
    // Prefer sandbox in development if explicitly enabled
    this.isSandbox = String(process.env.NOWPAYMENTS_USE_SANDBOX).toLowerCase() === 'true';
    this.baseApiURL = this.isSandbox ? this.sandboxURL : this.baseURL;

    this.client = axios.create({
      baseURL: this.baseApiURL,
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  // Get available cryptocurrencies
  async getAvailableCurrencies() {
    try {
      console.log('🔍 Fetching currencies from:', this.baseApiURL);
      const response = await this.client.get('/currencies');
      console.log('✅ Currencies fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching available currencies:', error.response?.data || error.message);
      console.error('Full error:', error);
      throw new Error('Failed to fetch available currencies');
    }
  }

  // Get minimum payment amount for a cryptocurrency
  async getMinimumPaymentAmount(currencyFrom, currencyTo) {
    try {
      const response = await this.client.get('/min-amount', {
        params: {
          currency_from: currencyFrom,
          currency_to: currencyTo
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching minimum payment amount:', error.response?.data || error.message);
      throw new Error('Failed to fetch minimum payment amount');
    }
  }

  // Get estimated price for a payment
  async getEstimatedPrice(amount, currencyFrom, currencyTo) {
    try {
      const response = await this.client.get('/estimate', {
        params: {
          amount,
          currency_from: currencyFrom,
          currency_to: currencyTo
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching estimated price:', error.response?.data || error.message);
      throw new Error('Failed to fetch estimated price');
    }
  }

  // Create a new payment
  async createPayment(paymentData) {
    try {
      console.log('🔍 Creating NOWPayments payment with data:', paymentData);
      
      const payload = {
        price_amount: paymentData.amount,
        price_currency: paymentData.priceCurrency || 'usd',
        pay_currency: paymentData.payCurrency,
        order_id: paymentData.orderId,
        order_description: paymentData.orderDescription,
        ipn_callback_url: paymentData.ipnCallbackUrl,
        // Optional fields supported by NOWPayments
        success_url: paymentData.successUrl,
        cancel_url: paymentData.cancelUrl,
        is_fixed_rate: paymentData.isFixedRate || true,
        // Let the customer cover network and service fees when requested
        is_fee_paid_by_user: (paymentData.isFeePaidByUser ?? true) === true
      };

      console.log('📋 Payment payload:', payload);

      const response = await this.client.post('/payment', payload);
      console.log('✅ Payment created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating payment:', error.response?.data || error.message);
      console.error('📊 Status:', error.response?.status);
      throw new Error(`Failed to create payment: ${error.response?.data?.message || error.message}`);
    }
  }

  // Create a new invoice (payment link)
  async createInvoice(invoiceData) {
    try {
      console.log('🔍 Creating NOWPayments invoice with data:', invoiceData);
      
      const payload = {
        price_amount: invoiceData.amount,
        price_currency: invoiceData.priceCurrency || 'usd',
        pay_currency: invoiceData.payCurrency,
        order_id: invoiceData.orderId,
        order_description: invoiceData.orderDescription,
        ipn_callback_url: invoiceData.ipnCallbackUrl,
        success_url: invoiceData.successUrl,
        cancel_url: invoiceData.cancelUrl,
        is_fixed_rate: invoiceData.isFixedRate || false
      };

      console.log('📋 Invoice payload:', payload);

      const response = await this.client.post('/invoice', payload);
      console.log('✅ Invoice created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating invoice:', error.response?.data || error.message);
      console.error('📊 Status:', error.response?.status);
      throw new Error(`Failed to create invoice: ${error.response?.data?.message || error.message}`);
    }
  }

  // Get payment status
  async getPaymentStatus(paymentId) {
    try {
      const response = await this.client.get(`/payment/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment status:', error.response?.data || error.message);
      throw new Error('Failed to fetch payment status');
    }
  }

  // Get payment status by payment ID
  async getPaymentStatusByPaymentId(paymentId) {
    try {
      const response = await this.client.get(`/payment/${paymentId}/status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment status by payment ID:', error.response?.data || error.message);
      throw new Error('Failed to fetch payment status');
    }
  }

  // Create a payout
  async createPayout(payoutData) {
    try {
      const payload = {
        withdrawals: [{
          address: payoutData.address,
          currency: payoutData.currency,
          amount: payoutData.amount
        }]
      };

      const response = await this.client.post('/payout', payload);
      return response.data;
    } catch (error) {
      console.error('Error creating payout:', error.response?.data || error.message);
      throw new Error('Failed to create payout');
    }
  }

  // Get payout status
  async getPayoutStatus(payoutId) {
    try {
      const response = await this.client.get(`/payout/${payoutId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payout status:', error.response?.data || error.message);
      throw new Error('Failed to fetch payout status');
    }
  }

  // Validate webhook signature
  validateWebhookSignature(payload, signature) {
    const crypto = require('crypto');
    const secret = process.env.NOWPAYMENTS_IPN_SECRET;
    
    if (!secret) {
      console.warn('NOWPAYMENTS_IPN_SECRET not configured');
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  // Process webhook data
  processWebhookData(webhookData) {
    const {
      payment_id,
      payment_status,
      pay_address,
      pay_amount,
      pay_currency,
      price_amount,
      price_currency,
      order_id,
      order_description,
      purchase_id,
      created_at,
      updated_at,
      outcome_amount,
      outcome_currency
    } = webhookData;

    return {
      paymentId: payment_id,
      paymentStatus: payment_status,
      payAddress: pay_address,
      payAmount: pay_amount,
      payCurrency: pay_currency,
      priceAmount: price_amount,
      priceCurrency: price_currency,
      orderId: order_id,
      orderDescription: order_description,
      purchaseId: purchase_id,
      createdAt: created_at,
      updatedAt: updated_at,
      outcomeAmount: outcome_amount,
      outcomeCurrency: outcome_currency
    };
  }

  // Get supported currencies
  async getSupportedCurrencies() {
    try {
      const response = await this.client.get('/currencies');
      return response.data;
    } catch (error) {
      console.error('Error fetching supported currencies:', error.response?.data || error.message);
      throw new Error('Failed to fetch supported currencies');
    }
  }

  // Get payment methods
  async getPaymentMethods() {
    try {
      const response = await this.client.get('/payment-methods');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error.response?.data || error.message);
      throw new Error('Failed to fetch payment methods');
    }
  }

  // Get withdrawal fee estimate
  async getWithdrawalFeeEstimate(currency, amount) {
    try {
      const response = await this.client.get('/payout/fee', {
        params: {
          currency: currency.toLowerCase(),
          amount: amount
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching withdrawal fee estimate:', error.response?.data || error.message);
      throw new Error('Failed to fetch withdrawal fee estimate');
    }
  }

  // Create invoice-based payment
  async createInvoicePayment(paymentData) {
    try {
      // Align with official docs: use /payment with optional success/cancel URLs; avoid unsupported fields
      const payload = {
        price_amount: paymentData.amount,
        price_currency: paymentData.priceCurrency || 'usd',
        pay_currency: paymentData.payCurrency,
        order_id: paymentData.orderId,
        order_description: paymentData.orderDescription,
        ipn_callback_url: paymentData.ipnCallbackUrl,
        success_url: paymentData.successUrl,
        cancel_url: paymentData.cancelUrl,
        is_fixed_rate: paymentData.isFixedRate || true,
        is_fee_paid_by_user: (paymentData.isFeePaidByUser ?? true) === true
      };

      const response = await this.client.post('/payment', payload);
      return response.data;
    } catch (error) {
      console.error('Error creating invoice payment:', error.response?.data || error.message);
      throw new Error('Failed to create invoice payment');
    }
  }

  // Get payment button HTML
  generatePaymentButton(invoiceId, buttonStyle = 'white') {
    const buttonImage = buttonStyle === 'black' 
      ? 'https://nowpayments.io/images/embeds/payment-button-black.svg'
      : 'https://nowpayments.io/images/embeds/payment-button-white.svg';
    
    const buttonAlt = buttonStyle === 'black'
      ? 'Crypto payment button by NOWPayments'
      : 'Cryptocurrency & Bitcoin payment button by NOWPayments';

    return `<a href="https://nowpayments.io/payment/?iid=${invoiceId}&source=button" target="_blank" rel="noreferrer noopener">
  <img src="${buttonImage}" alt="${buttonAlt}">
</a>`;
  }

  // Get payment button data for frontend
  getPaymentButtonData(invoiceId, buttonStyle = 'white') {
    return {
      invoiceId,
      buttonStyle,
      paymentUrl: `https://nowpayments.io/payment/?iid=${invoiceId}&source=button`,
      buttonImage: buttonStyle === 'black' 
        ? 'https://nowpayments.io/images/embeds/payment-button-black.svg'
        : 'https://nowpayments.io/images/embeds/payment-button-white.svg',
      buttonAlt: buttonStyle === 'black'
        ? 'Crypto payment button by NOWPayments'
        : 'Cryptocurrency & Bitcoin payment button by NOWPayments'
    };
  }
}

export default new NOWPaymentsService(); 