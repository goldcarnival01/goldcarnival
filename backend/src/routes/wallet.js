import express from 'express';
import { body, validationResult } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import { sendEmail } from '../services/emailService.js';
import nowpaymentsService from '../services/nowpaymentsService.js';

const router = express.Router();

// Get wallet balances
router.get('/balance', asyncHandler(async (req, res) => {
  const wallets = await Wallet.findAll({
    where: { userId: req.user.id },
    attributes: ['id', 'walletType', 'balance', 'currency', 'isActive']
  });

  res.json({
    message: 'Wallet balances retrieved successfully',
    wallets
  });
}));

// Get available cryptocurrencies
router.get('/crypto-currencies', asyncHandler(async (req, res) => {
  try {
    const currencies = await nowpaymentsService.getAvailableCurrencies();
    res.json({
      message: 'Available cryptocurrencies retrieved successfully',
      currencies
    });
  } catch (error) {
    res.status(500).json({
      error: 'Service Error',
      message: error.message
    });
  }
}));

// Get minimum payment amount
router.get('/min-amount', asyncHandler(async (req, res) => {
  const { currencyFrom, currencyTo } = req.query;
  
  if (!currencyFrom || !currencyTo) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'currencyFrom and currencyTo are required'
    });
  }

  try {
    const minAmount = await nowpaymentsService.getMinimumPaymentAmount(currencyFrom, currencyTo);
    res.json({
      message: 'Minimum payment amount retrieved successfully',
      minAmount
    });
  } catch (error) {
    res.status(500).json({
      error: 'Service Error',
      message: error.message
    });
  }
}));

// Get estimated price
router.get('/estimate-price', asyncHandler(async (req, res) => {
  const { amount, currencyFrom, currencyTo } = req.query;
  
  if (!amount || !currencyFrom || !currencyTo) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'amount, currencyFrom, and currencyTo are required'
    });
  }

  try {
    const estimate = await nowpaymentsService.getEstimatedPrice(amount, currencyFrom, currencyTo);
    res.json({
      message: 'Price estimate retrieved successfully',
      estimate
    });
  } catch (error) {
    res.status(500).json({
      error: 'Service Error',
      message: error.message
    });
  }
}));

// Deposit funds via NOWPayments
router.post('/deposit', [
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least $1'),
  body('payCurrency').isString().withMessage('Pay currency is required'),
  body('priceCurrency').optional().isString().withMessage('Price currency must be a string')
], asyncHandler(async (req, res) => {
  console.log('🔍 Deposit request:', { 
    amount: req.body.amount, 
    payCurrency: req.body.payCurrency, 
    priceCurrency: req.body.priceCurrency,
    userId: req.user?.id 
  });

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Validation errors:', errors.array());
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Please check your input data',
      details: errors.array()
    });
  }

  const { amount, payCurrency, priceCurrency = 'usd' } = req.body;
  const userId = req.user.id;

  try {
    console.log('🔍 Looking for deposit wallet for user:', userId);
    
    // Get deposit wallet
    let depositWallet = await Wallet.findOne({
      where: { userId, walletType: 'deposit' }
    });

    console.log('🔍 Deposit wallet found:', depositWallet ? 'Yes' : 'No');

    if (!depositWallet) {
      console.log('❌ Deposit wallet not found for user:', userId);
      console.log('🔍 Creating deposit wallet for user:', userId);
      
      // Create deposit wallet if it doesn't exist
      const newDepositWallet = await Wallet.create({
        userId,
        walletType: 'deposit',
        balance: 0,
        currency: 'USD',
        isActive: true
      });
      
      console.log('✅ Created deposit wallet:', newDepositWallet.id);
      
      // Use the new wallet
      depositWallet = newDepositWallet;
    }

    // Create transaction record
    const transaction = await Transaction.create({
      userId,
      walletId: depositWallet.id,
      transactionType: 'deposit',
      amount: parseFloat(amount),
      cryptoType: payCurrency.toUpperCase(),
      gateway: 'nowpayments',
      status: 'pending',
      referenceId: `NOW_${Date.now()}_${userId}`,
      description: `Crypto deposit via NOWPayments - ${payCurrency.toUpperCase()}`
    });

    // Create invoice with NOWPayments
    const invoiceData = {
      amount: parseFloat(amount),
      priceCurrency,
      payCurrency: payCurrency.toLowerCase(),
      orderId: transaction.referenceId,
      orderDescription: `Deposit for user ${req.user.memberId || req.user.id || userId}`,
      ipnCallbackUrl: `${process.env.BACKEND_URL}/api/nowpayments/webhook`,
      successUrl: `${process.env.FRONTEND_URL}/dashboard/payment-success`,
      cancelUrl: `${process.env.FRONTEND_URL}/dashboard/payment-cancelled`,
      isFixedRate: false
    };

    console.log('🔍 Creating NOWPayments invoice with data:', invoiceData);
    console.log('🔍 BACKEND_URL:', process.env.BACKEND_URL);

    const invoice = await nowpaymentsService.createInvoice(invoiceData);

    // Update transaction with invoice details
    await transaction.update({
      gatewayResponse: JSON.stringify(invoice),
      cryptoAddress: invoice.pay_address || null,
      transactionHash: invoice.id
    });

    res.json({
      message: 'Invoice created successfully',
      payment: {
        invoiceId: invoice.id,
        paymentUrl: invoice.invoice_url,
        payAddress: invoice.pay_address || null,
        payAmount: invoice.pay_amount || null,
        payCurrency: invoice.pay_currency,
        priceAmount: invoice.price_amount,
        priceCurrency: invoice.price_currency,
        orderId: invoice.order_id,
        status: 'waiting',
        transactionId: transaction.id,
        referenceId: transaction.referenceId
      }
    });
  } catch (error) {
    console.error('❌ Payment creation error:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Check if it's a database error
    if (error.name === 'SequelizeConnectionError' || error.name === 'SequelizeDatabaseError') {
      console.error('🗄️ Database error detected');
      return res.status(500).json({
        error: 'Database Error',
        message: 'Database connection issue. Please try again.'
      });
    }
    
    // Check if it's a NOWPayments API error
    if (error.message.includes('Failed to create payment')) {
      console.error('💳 NOWPayments API error detected');
      return res.status(500).json({
        error: 'Payment Service Error',
        message: 'Payment service is temporarily unavailable. Please try again.'
      });
    }
    
    res.status(500).json({
      error: 'Payment Error',
      message: error.message
    });
  }
}));

// Withdraw funds via NOWPayments
router.post('/withdraw', [
  body('amount').isFloat({ min: 50 }).withMessage('Minimum withdrawal amount is $50'),
  body('currency').isString().withMessage('Currency is required'),
  body('address').isString().withMessage('Crypto address is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Please check your input data',
      details: errors.array()
    });
  }

  const { amount, currency, address } = req.body;
  const userId = req.user.id;

  try {
    // Get winnings wallet
    const winningsWallet = await Wallet.findOne({
      where: { userId, walletType: 'winnings' }
    });

    if (!winningsWallet) {
      return res.status(500).json({
        error: 'Wallet Error',
        message: 'Winnings wallet not found'
      });
    }

    // Check if user has sufficient balance
    if (parseFloat(winningsWallet.balance) < parseFloat(amount)) {
      return res.status(400).json({
        error: 'Insufficient Balance',
        message: 'You do not have sufficient balance for withdrawal'
      });
    }

    // Create transaction record
    const transaction = await Transaction.create({
      userId,
      walletId: winningsWallet.id,
      transactionType: 'withdrawal',
      amount: parseFloat(amount),
      cryptoType: currency.toUpperCase(),
      cryptoAddress: address,
      gateway: 'nowpayments',
      status: 'pending',
      referenceId: `NOW_WTH_${Date.now()}_${userId}`,
      description: `Crypto withdrawal via NOWPayments - ${currency.toUpperCase()}`
    });

    // Create payout with NOWPayments
    const payoutData = {
      address,
      currency: currency.toLowerCase(),
      amount: parseFloat(amount)
    };

    const payout = await nowpaymentsService.createPayout(payoutData);

    // Update transaction with payout details
    await transaction.update({
      gatewayResponse: JSON.stringify(payout)
    });

    // Deduct balance from wallet
    await winningsWallet.deductBalance(amount);

    res.json({
      message: 'Withdrawal request submitted successfully. Funds will be processed within ~1 hour.',
      payout: {
        payoutId: payout.id,
        address: payout.address,
        amount: payout.amount,
        currency: payout.currency,
        status: payout.status,
        transactionId: transaction.id,
        referenceId: transaction.referenceId
      }
    });
  } catch (error) {
    console.error('Withdrawal creation error:', error);
    res.status(500).json({
      error: 'Withdrawal Error',
      message: error.message
    });
  }
}));

// Get transaction history
router.get('/transactions', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type, status } = req.query;
  const offset = (page - 1) * limit;

  const whereClause = { userId: req.user.id };
  if (type) whereClause.transactionType = type;
  if (status) whereClause.status = status;

  const transactions = await Transaction.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Wallet,
        as: 'wallet',
        attributes: ['walletType']
      }
    ],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    message: 'Transaction history retrieved successfully',
    transactions: transactions.rows,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(transactions.count / limit),
      totalItems: transactions.count,
      itemsPerPage: parseInt(limit)
    }
  });
}));

export default router; 