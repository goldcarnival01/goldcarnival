# NOWPayments Integration Guide

## Overview

This document describes the integration of NOWPayments crypto payment gateway into the Gold Carnival application. NOWPayments allows users to deposit and withdraw funds using various cryptocurrencies.

## Configuration

### Environment Variables

Add the following environment variables to your `.env` file:

```env
# NOWPayments Configuration
NOWPAYMENTS_API_KEY=N6N5VX3-580MJNM-G48F2T8-JA81FVX
NOWPAYMENTS_IPN_SECRET=your-ipn-secret-key-change-in-production
```

### Your NOWPayments Invoice

You have successfully created a NOWPayments invoice:
- **Invoice ID**: 4623807894
- **Price**: 3 USDT
- **Status**: Active

This invoice can be used for testing the payment integration.

### API Key Setup

1. Sign up for a NOWPayments account at https://nowpayments.io
2. Get your API key from the dashboard
3. Set up IPN (Instant Payment Notification) webhook URL: `https://your-domain.com/api/nowpayments/webhook`
4. Generate an IPN secret key for webhook signature validation

## API Endpoints

### Wallet Endpoints (Enhanced with NOWPayments)

#### GET /api/wallet/crypto-currencies
Get available cryptocurrencies for payments.

**Response:**
```json
{
  "message": "Available cryptocurrencies retrieved successfully",
  "currencies": {
    "currencies": ["btc", "eth", "ltc", "bch", "xrp", "doge", "usdt", "usdc"]
  }
}
```

#### GET /api/wallet/min-amount
Get minimum payment amount for a specific cryptocurrency.

**Parameters:**
- `currencyFrom` (string): Source currency (e.g., "usd")
- `currencyTo` (string): Target cryptocurrency (e.g., "btc")

**Response:**
```json
{
  "message": "Minimum payment amount retrieved successfully",
  "minAmount": {
    "min_amount": "0.0001"
  }
}
```

#### GET /api/wallet/estimate-price
Get estimated price for a payment amount.

**Parameters:**
- `amount` (number): Amount in source currency
- `currencyFrom` (string): Source currency
- `currencyTo` (string): Target cryptocurrency

**Response:**
```json
{
  "message": "Price estimate retrieved successfully",
  "estimate": {
    "currency_from": "usd",
    "currency_to": "btc",
    "amount_from": "100",
    "amount_to": "0.0025"
  }
}
```

#### POST /api/wallet/deposit
Create a crypto deposit payment.

**Request Body:**
```json
{
  "amount": 100,
  "payCurrency": "btc",
  "priceCurrency": "usd"
}
```

**Response:**
```json
{
  "message": "Payment created successfully",
  "payment": {
    "paymentId": "payment_id_from_nowpayments",
    "payAddress": "crypto_address_for_payment",
    "payAmount": "0.0025",
    "payCurrency": "btc",
    "priceAmount": "100",
    "priceCurrency": "usd",
    "orderId": "NOW_1234567890_123",
    "status": "waiting",
    "transactionId": 456,
    "referenceId": "NOW_1234567890_123"
  }
}
```

#### POST /api/wallet/withdraw
Create a crypto withdrawal.

**Request Body:**
```json
{
  "amount": 50,
  "currency": "btc",
  "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
}
```

**Response:**
```json
{
  "message": "Withdrawal request submitted successfully",
  "payout": {
    "payoutId": "payout_id_from_nowpayments",
    "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    "amount": "0.00125",
    "currency": "btc",
    "status": "pending",
    "transactionId": 789,
    "referenceId": "NOW_WTH_1234567890_123"
  }
}
```

### NOWPayments Specific Endpoints

#### GET /api/nowpayments/currencies
Get all available cryptocurrencies from NOWPayments.

#### GET /api/nowpayments/min-amount
Get minimum payment amount (same as wallet endpoint).

#### GET /api/nowpayments/estimate
Get price estimate (same as wallet endpoint).

#### POST /api/nowpayments/create-payment
Create a payment directly via NOWPayments API.

#### GET /api/nowpayments/payment-status/:paymentId
Get payment status by payment ID.

#### POST /api/nowpayments/create-withdrawal
Create a withdrawal directly via NOWPayments API.

#### GET /api/nowpayments/payout-status/:payoutId
Get payout status by payout ID.

#### GET /api/nowpayments/withdrawal-fee
Get withdrawal fee estimate for a cryptocurrency.

#### POST /api/nowpayments/create-invoice-payment
Create an invoice-based payment with custom success/cancel URLs.

#### GET /api/nowpayments/payment-button/:invoiceId
Get payment button data for a specific invoice.

#### GET /api/nowpayments/payment-button-html/:invoiceId
Get payment button HTML for embedding.

## Payment Button Integration

### Using Your Invoice (4623807894)

You can integrate the payment button directly using your invoice ID:

```html
<!-- White button -->
<a href="https://nowpayments.io/payment/?iid=4623807894&source=button" target="_blank" rel="noreferrer noopener">
   <img src="https://nowpayments.io/images/embeds/payment-button-white.svg" alt="Cryptocurrency & Bitcoin payment button by NOWPayments">
</a>

<!-- Black button -->
<a href="https://nowpayments.io/payment/?iid=4623807894&source=button" target="_blank" rel="noreferrer noopener">
   <img src="https://nowpayments.io/images/embeds/payment-button-black.svg" alt="Crypto payment button by NOWPayments">
</a>
```

### React Component Usage

```jsx
import NOWPaymentsButton from './components/NOWPaymentsButton';

// Use your invoice ID
<NOWPaymentsButton 
  invoiceId="4623807894" 
  style="white" 
  onPaymentClick={(url) => console.log('Payment clicked:', url)}
/>
```

## Webhook Processing

### Webhook Endpoint: POST /api/nowpayments/webhook

The webhook endpoint processes payment notifications from NOWPayments and updates transaction statuses accordingly.

**Supported Payment Statuses:**
- `confirmed` / `finished`: Payment completed, wallet balance updated
- `failed` / `expired`: Payment failed
- `pending`: Payment still pending

**Webhook Security:**
- Validates webhook signature using HMAC-SHA512
- Requires `NOWPAYMENTS_IPN_SECRET` environment variable
- Returns 401 for invalid signatures

## Database Schema

### Transaction Model Updates

The Transaction model has been enhanced to support NOWPayments:

```javascript
{
  // ... existing fields
  cryptoType: DataTypes.STRING(50),        // Cryptocurrency type (BTC, ETH, etc.)
  cryptoAddress: DataTypes.STRING(255),    // Crypto address for payment
  transactionHash: DataTypes.STRING(255),  // NOWPayments payment ID
  gateway: DataTypes.STRING(50),           // Payment gateway (nowpayments)
  gatewayResponse: DataTypes.TEXT,         // Full gateway response JSON
  // ... other fields
}
```

## Error Handling

### Common Error Responses

```json
{
  "error": "Payment Error",
  "message": "Failed to create payment"
}
```

```json
{
  "error": "Validation Error",
  "message": "Please check your input data",
  "details": [
    {
      "field": "amount",
      "message": "Amount must be at least $1"
    }
  ]
}
```

## Frontend Integration

### API Service Updates

The frontend API service has been updated with new endpoints:

```javascript
// Wallet API with crypto support
export const walletAPI = {
  getBalance: () => api.get('/wallet/balance'),
  deposit: (depositData) => api.post('/wallet/deposit', depositData),
  withdraw: (withdrawData) => api.post('/wallet/withdraw', withdrawData),
  getTransactions: (params) => api.get('/wallet/transactions', { params }),
  getCryptoCurrencies: () => api.get('/wallet/crypto-currencies'),
  getMinAmount: (params) => api.get('/wallet/min-amount', { params }),
  getEstimatePrice: (params) => api.get('/wallet/estimate-price', { params }),
};

// NOWPayments specific API
export const nowpaymentsAPI = {
  getCurrencies: () => api.get('/nowpayments/currencies'),
  getMinAmount: (params) => api.get('/nowpayments/min-amount', { params }),
  getEstimate: (params) => api.get('/nowpayments/estimate', { params }),
  createPayment: (paymentData) => api.post('/nowpayments/create-payment', paymentData),
  getPaymentStatus: (paymentId) => api.get(`/nowpayments/payment-status/${paymentId}`),
  createWithdrawal: (withdrawalData) => api.post('/nowpayments/create-withdrawal', withdrawalData),
  getPayoutStatus: (payoutId) => api.get(`/nowpayments/payout-status/${payoutId}`),
};
```

## Testing

### Sandbox Mode

In development mode, the service automatically uses NOWPayments sandbox API:
- Sandbox URL: `https://api.sandbox.nowpayments.io/v1`
- Production URL: `https://api.nowpayments.io/v1`

### Test Payment Flow

1. Create a deposit payment
2. Check payment status
3. Simulate payment completion via webhook
4. Verify wallet balance update

## Security Considerations

1. **API Key Security**: Store API keys securely in environment variables
2. **Webhook Validation**: Always validate webhook signatures
3. **HTTPS**: Use HTTPS in production for all webhook endpoints
4. **Rate Limiting**: Implement rate limiting for payment endpoints
5. **Input Validation**: Validate all payment inputs
6. **Error Logging**: Log payment errors for debugging

## Troubleshooting

### Common Issues

1. **Invalid API Key**: Check `NOWPAYMENTS_API_KEY` environment variable
2. **Webhook Failures**: Verify `NOWPAYMENTS_IPN_SECRET` and webhook URL
3. **Payment Timeouts**: Check network connectivity to NOWPayments API
4. **Database Errors**: Ensure Transaction model is properly migrated

### Debug Endpoints

- `GET /health`: Check server status
- `GET /api/routes`: List all available API routes

## Support

For NOWPayments API support:
- Documentation: https://documenter.getpostman.com/view/2393084/TzXwGEdS
- Support: https://nowpayments.io/support

For application-specific issues, check the server logs and transaction records. 