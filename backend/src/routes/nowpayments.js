import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import Plan from '../models/Plan.js';
import UserPlan from '../models/UserPlan.js';
import nowpaymentsService from '../services/nowpaymentsService.js';
import { sendEmail } from '../services/emailService.js';

const router = express.Router();

// Public test endpoint (no authentication required)
router.get('/test-public', (req, res) => {
  console.log('🔍 NOWPayments public test endpoint hit');
  res.json({
    message: 'NOWPayments public endpoint working',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin
  });
});

// Test webhook processing (for development/testing)
router.post('/test-webhook', asyncHandler(async (req, res) => {
  console.log('🧪 Testing webhook processing...');
  
  const { transactionId, paymentStatus, planId } = req.body;
  
  if (!transactionId || !paymentStatus) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'transactionId and paymentStatus are required'
    });
  }

  try {
    // Find transaction
    const transaction = await Transaction.findByPk(transactionId);
    if (!transaction) {
      return res.status(404).json({
        error: 'Transaction not found',
        message: `Transaction with ID ${transactionId} not found`
      });
    }

    // Simulate webhook data
    const mockWebhookData = {
      payment_id: transaction.transactionHash || 'test_payment_id',
      payment_status: paymentStatus,
      pay_address: transaction.cryptoAddress || 'test_address',
      pay_amount: '0.001',
      pay_currency: transaction.cryptoType?.toLowerCase() || 'btc',
      price_amount: transaction.amount.toString(),
      price_currency: 'usd',
      order_id: transaction.referenceId,
      order_description: transaction.description,
      purchase_id: 'test_purchase_id',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      outcome_amount: '0.001',
      outcome_currency: transaction.cryptoType?.toLowerCase() || 'btc'
    };

    // Process webhook data
    const webhookData = nowpaymentsService.processWebhookData(mockWebhookData);
    
    // Update transaction based on payment status
    switch (webhookData.paymentStatus) {
      case 'confirmed':
      case 'finished':
        console.log('🎉 Simulating successful payment...');
        
        await transaction.update({
          status: 'completed',
          processedAt: new Date(),
          gatewayResponse: JSON.stringify(webhookData)
        });

        // Check if this is a plan purchase
        let planMetadata = null;
        try {
          if (transaction.metadata) {
            planMetadata = JSON.parse(transaction.metadata);
          }
        } catch (error) {
          console.error('Error parsing transaction metadata:', error);
        }

        if (planMetadata && planMetadata.planId) {
          console.log('📋 Creating UserPlan entry for plan:', planMetadata.planId);
          
          const plan = await Plan.findByPk(planMetadata.planId);
          if (plan) {
            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);

            const userPlan = await UserPlan.create({
              userId: transaction.userId,
              planId: planMetadata.planId,
              purchasePrice: transaction.amount,
              expiryDate: expiryDate,
              paymentMethod: 'crypto',
              transactionId: transaction.referenceId,
              status: 'active',
              isActive: true,
              notes: `Test webhook - Purchased via NOWPayments crypto payment`
            });

            console.log('✅ Test UserPlan created successfully:', userPlan.id);
          }
        }

        res.json({
          message: 'Test webhook processed successfully',
          status: 'completed',
          transaction: transaction.id,
          userPlan: planMetadata ? 'created' : 'not applicable'
        });
        break;

      case 'failed':
      case 'expired':
        console.log('❌ Simulating failed payment...');
        
        await transaction.update({
          status: 'failed',
          processedAt: new Date(),
          gatewayResponse: JSON.stringify(webhookData)
        });

        res.json({
          message: 'Test webhook processed successfully',
          status: 'failed',
          transaction: transaction.id
        });
        break;

      default:
        res.status(400).json({
          error: 'Invalid payment status',
          message: 'paymentStatus must be confirmed, finished, failed, or expired'
        });
    }
  } catch (error) {
    console.error('Test webhook error:', error);
    res.status(500).json({
      error: 'Test webhook failed',
      message: error.message
    });
  }
}));

// Get available cryptocurrencies
router.get('/currencies', asyncHandler(async (req, res) => {
  console.log('🔍 Currencies request from user:', req.user?.id);
  try {
    const currencies = await nowpaymentsService.getAvailableCurrencies();
    res.json({
      message: 'Available currencies retrieved successfully',
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
router.get('/min-amount', [
  query('currencyFrom').isString().withMessage('currencyFrom is required'),
  query('currencyTo').isString().withMessage('currencyTo is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Please check your input data',
      details: errors.array()
    });
  }

  const { currencyFrom, currencyTo } = req.query;
  
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
router.get('/estimate', [
  query('amount').isFloat({ min: 0.01 }).withMessage('amount must be at least 0.01'),
  query('currencyFrom').isString().withMessage('currencyFrom is required'),
  query('currencyTo').isString().withMessage('currencyTo is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Please check your input data',
      details: errors.array()
    });
  }

  const { amount, currencyFrom, currencyTo } = req.query;
  
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

// Create crypto payment with plan selection
router.post('/create-payment', [
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least $1'),
  body('payCurrency').isString().withMessage('Pay currency is required'),
  body('priceCurrency').optional().isString().withMessage('Price currency must be a string'),
  body('planId').optional().isInt().withMessage('Plan ID must be a valid integer')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Please check your input data',
      details: errors.array()
    });
  }

  const { amount, payCurrency, priceCurrency = 'usd', planId } = req.body;
  const userId = req.user.id;

  try {
    // Get user details
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User Error',
        message: 'User not found'
      });
    }

    // Get deposit wallet
    const depositWallet = await Wallet.findOne({
      where: { userId, walletType: 'deposit' }
    });

    if (!depositWallet) {
      return res.status(500).json({
        error: 'Wallet Error',
        message: 'Deposit wallet not found'
      });
    }

    // Validate plan if provided
    let plan = null;
    if (planId) {
      plan = await Plan.findByPk(planId);
      if (!plan || !plan.isActive) {
        return res.status(400).json({
          error: 'Plan Error',
          message: 'Selected plan not found or not active'
        });
      }
      
      // Check if plan price matches payment amount
      if (parseFloat(plan.price || plan.amount) !== parseFloat(amount)) {
        return res.status(400).json({
          error: 'Plan Error',
          message: 'Payment amount does not match plan price'
        });
      }
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
      description: planId 
        ? `Plan purchase via NOWPayments - ${plan.name} (${payCurrency.toUpperCase()})`
        : `Crypto deposit via NOWPayments - ${payCurrency.toUpperCase()}`,
      metadata: planId ? JSON.stringify({ planId, planName: plan.name }) : null
    });

    // Create payment with NOWPayments
    const paymentData = {
      amount: parseFloat(amount),
      priceCurrency,
      payCurrency: payCurrency.toLowerCase(),
      orderId: transaction.referenceId,
      orderDescription: `Deposit for user ${user.memberId || user.id}`,
      ipnCallbackUrl: `${process.env.BACKEND_URL}/api/nowpayments/webhook`,
      isFixedRate: true,
      isFeePaidByUser: true
    };

    const payment = await nowpaymentsService.createPayment(paymentData);

    // Update transaction with payment details
    await transaction.update({
      gatewayResponse: JSON.stringify(payment),
      cryptoAddress: payment.pay_address,
      transactionHash: payment.payment_id
    });

    res.json({
      message: 'Payment created successfully',
      payment: {
        paymentId: payment.payment_id,
        payAddress: payment.pay_address,
        payAmount: payment.pay_amount,
        payCurrency: payment.pay_currency,
        priceAmount: payment.price_amount,
        priceCurrency: payment.price_currency,
        orderId: payment.order_id,
        status: payment.payment_status,
        transactionId: transaction.id,
        referenceId: transaction.referenceId
      }
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({
      error: 'Payment Error',
      message: error.message
    });
  }
}));

// Create crypto payment specifically for plan purchase
router.post('/create-plan-payment', [
  body('planId').isInt().withMessage('Plan ID is required'),
  body('payCurrency').isString().withMessage('Pay currency is required'),
  body('priceCurrency').optional().isString().withMessage('Price currency must be a string')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Please check your input data',
      details: errors.array()
    });
  }

  const { planId, payCurrency, priceCurrency = 'usd' } = req.body;
  const userId = req.user.id;

  try {
    // Get user details
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User Error',
        message: 'User not found'
      });
    }

    // Get plan details
    const plan = await Plan.findByPk(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({
        error: 'Plan Error',
        message: 'Selected plan not found or not active'
      });
    }

    // Check if user already has this plan active
    const existingPlan = await UserPlan.findOne({
      where: {
        userId,
        planId,
        status: 'active',
        isActive: true
      }
    });

    if (existingPlan) {
      return res.status(400).json({
        error: 'Plan Error',
        message: 'You already have this plan active'
      });
    }

    // Get deposit wallet
    const depositWallet = await Wallet.findOne({
      where: { userId, walletType: 'deposit' }
    });

    if (!depositWallet) {
      return res.status(500).json({
        error: 'Wallet Error',
        message: 'Deposit wallet not found'
      });
    }

    // Create transaction record for plan purchase
    const transaction = await Transaction.create({
      userId,
      walletId: depositWallet.id,
      transactionType: 'deposit',
      amount: parseFloat(plan.price || plan.amount),
      cryptoType: payCurrency.toUpperCase(),
      gateway: 'nowpayments',
      status: 'pending',
      referenceId: `NOW_PLAN_${Date.now()}_${userId}`,
      description: `Plan purchase via NOWPayments - ${plan.name} (${payCurrency.toUpperCase()})`,
      metadata: JSON.stringify({ 
        planId, 
        planName: plan.name,
        isPlanPurchase: true 
      })
    });

    // Create payment with NOWPayments
    const paymentData = {
      amount: parseFloat(plan.price || plan.amount),
      priceCurrency,
      payCurrency: payCurrency.toLowerCase(),
      orderId: transaction.referenceId,
      orderDescription: `Plan purchase: ${plan.name} for user ${user.memberId || user.id}`,
      ipnCallbackUrl: `${process.env.BACKEND_URL}/api/nowpayments/webhook`,
      isFixedRate: true,
      isFeePaidByUser: true
    };

    const payment = await nowpaymentsService.createPayment(paymentData);

    // Update transaction with payment details
    await transaction.update({
      gatewayResponse: JSON.stringify(payment),
      cryptoAddress: payment.pay_address,
      transactionHash: payment.payment_id
    });

    res.json({
      message: 'Plan payment created successfully',
      payment: {
        paymentId: payment.payment_id,
        payAddress: payment.pay_address,
        payAmount: payment.pay_amount,
        payCurrency: payment.pay_currency,
        priceAmount: payment.price_amount,
        priceCurrency: payment.price_currency,
        orderId: payment.order_id,
        status: payment.payment_status,
        transactionId: transaction.id,
        referenceId: transaction.referenceId,
        plan: {
          id: plan.id,
          name: plan.name,
          price: plan.price || plan.amount,
          features: plan.features
        }
      }
    });
  } catch (error) {
    console.error('Plan payment creation error:', error);
    res.status(500).json({
      error: 'Payment Error',
      message: error.message
    });
  }
}));

// Get payment status
router.get('/payment-status/:paymentId', asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  try {
    const paymentStatus = await nowpaymentsService.getPaymentStatus(paymentId);
    res.json({
      message: 'Payment status retrieved successfully',
      paymentStatus
    });
  } catch (error) {
    res.status(500).json({
      error: 'Service Error',
      message: error.message
    });
  }
}));

// Webhook endpoint for payment notifications
router.post('/webhook', asyncHandler(async (req, res) => {
  const signature = req.headers['x-nowpayments-sig'];
  const payload = req.body;

  try {
    // Validate webhook signature
    if (!nowpaymentsService.validateWebhookSignature(payload, signature)) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Process webhook data
    const webhookData = nowpaymentsService.processWebhookData(payload);
    
    // Find transaction by order ID
    const transaction = await Transaction.findOne({
      where: { referenceId: webhookData.orderId }
    });

    if (!transaction) {
      console.error('Transaction not found for order ID:', webhookData.orderId);
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Update transaction based on payment status
    switch (webhookData.paymentStatus) {
      case 'confirmed':
      case 'finished':
        console.log('🎉 Payment confirmed! Processing plan assignment...');
        
        // Payment confirmed - update transaction and wallet
        await transaction.update({
          status: 'completed',
          processedAt: new Date(),
          gatewayResponse: JSON.stringify(webhookData)
        });

        // Check if this is a plan purchase
        let planMetadata = null;
        try {
          if (transaction.metadata) {
            planMetadata = JSON.parse(transaction.metadata);
          }
        } catch (error) {
          console.error('Error parsing transaction metadata:', error);
        }

        if (planMetadata && planMetadata.planId) {
          try {
            console.log('📋 Creating UserPlan entry for plan:', planMetadata.planId);
            
            // Get plan details
            const plan = await Plan.findByPk(planMetadata.planId);
            if (!plan) {
              console.error('❌ Plan not found:', planMetadata.planId);
            } else {
              // Check if user already has this plan active
              const existingPlan = await UserPlan.findOne({
                where: {
                  userId: transaction.userId,
                  planId: planMetadata.planId,
                  status: 'active',
                  isActive: true
                }
              });

              if (existingPlan) {
                console.log('⚠️ User already has this plan active, extending expiry');
                // Extend existing plan by 1 year
                const newExpiryDate = new Date(existingPlan.expiryDate);
                newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
                await existingPlan.update({
                  expiryDate: newExpiryDate,
                  notes: `Extended via crypto payment - ${new Date().toISOString()}`
                });
              } else {
                // Create new user plan
                const expiryDate = new Date();
                expiryDate.setFullYear(expiryDate.getFullYear() + 1);

                const userPlan = await UserPlan.create({
                  userId: transaction.userId,
                  planId: planMetadata.planId,
                  purchasePrice: transaction.amount,
                  expiryDate: expiryDate,
                  paymentMethod: 'crypto',
                  transactionId: transaction.referenceId,
                  status: 'active',
                  isActive: true,
                  notes: `Purchased via NOWPayments crypto payment`
                });

                console.log('✅ UserPlan created successfully:', userPlan.id);
              }
            }
          } catch (error) {
            console.error('❌ Error creating UserPlan:', error);
            // Don't fail the webhook if plan creation fails
          }
        } else {
          console.log('💰 Regular deposit - adding balance to wallet');
          // Add balance to wallet for regular deposits
        const wallet = await Wallet.findByPk(transaction.walletId);
        if (wallet) {
          await wallet.addBalance(transaction.amount);
          }
        }

        // Send confirmation email
        const user = await User.findByPk(transaction.userId);
        if (user) {
          const data = {
              name: user.firstName || user.memberId,
              amount: transaction.amount,
              currency: 'USD',
              transactionId: transaction.referenceId,
              cryptoAmount: webhookData.payAmount,
              cryptoCurrency: webhookData.payCurrency
          };

          // Use existing 'deposit' template for both deposit and plan purchase confirmations
          await sendEmail({
            to: user.email,
            template: 'deposit',
            data
          });
        }
        break;

      case 'failed':
      case 'expired':
        console.log('❌ Payment failed! Updating transaction status...');
        
        // Payment failed - update transaction
        await transaction.update({
          status: 'failed',
          processedAt: new Date(),
          gatewayResponse: JSON.stringify(webhookData)
        });

        // Send failure notification email (simple content without template)
        const failedUser = await User.findByPk(transaction.userId);
        if (failedUser) {
          try {
            const subject = 'Payment Failed';
            const failureReason = webhookData.paymentStatus === 'expired' ? 'Payment expired' : 'Payment failed';
            const html = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #ff4d4f;">Payment Failed</h2>
                <p>Hello ${failedUser.firstName || failedUser.memberId},</p>
                <p>Your crypto payment could not be completed.</p>
                <p><strong>Reason:</strong> ${failureReason}</p>
                <p><strong>Amount:</strong> $${transaction.amount}</p>
                <p><strong>Transaction ID:</strong> ${transaction.referenceId}</p>
              </div>
            `;
            await sendEmail({ to: failedUser.email, subject, html, text: `Payment failed (${failureReason}). Amount: $${transaction.amount}. Transaction: ${transaction.referenceId}.` });
            console.log('📧 Payment failure email sent to user');
          } catch (emailError) {
            console.error('❌ Error sending failure email:', emailError);
          }
        }
        break;

      case 'pending':
        // Payment pending - update transaction
        await transaction.update({
          status: 'pending',
          gatewayResponse: JSON.stringify(webhookData)
        });
        break;

      default:
        console.log('Unknown payment status:', webhookData.paymentStatus);
    }

    res.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}));

// Create crypto withdrawal
router.post('/create-withdrawal', [
  body('amount').isFloat({ min: 10 }).withMessage('Minimum withdrawal amount is $10'),
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
      message: 'Withdrawal request submitted successfully',
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

// Get payout status
router.get('/payout-status/:payoutId', asyncHandler(async (req, res) => {
  const { payoutId } = req.params;

  try {
    const payoutStatus = await nowpaymentsService.getPayoutStatus(payoutId);
    res.json({
      message: 'Payout status retrieved successfully',
      payoutStatus
    });
  } catch (error) {
    res.status(500).json({
      error: 'Service Error',
      message: error.message
    });
  }
}));

// Get withdrawal fee estimate
router.get('/withdrawal-fee', asyncHandler(async (req, res) => {
  const { currency, amount } = req.query;
  
  if (!currency || !amount) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'currency and amount are required'
    });
  }

  try {
    const feeEstimate = await nowpaymentsService.getWithdrawalFeeEstimate(currency, amount);
    res.json({
      message: 'Withdrawal fee estimate retrieved successfully',
      feeEstimate
    });
  } catch (error) {
    res.status(500).json({
      error: 'Service Error',
      message: error.message
    });
  }
}));

// Create invoice-based payment
router.post('/create-invoice-payment', [
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least $1'),
  body('payCurrency').isString().withMessage('Pay currency is required'),
  body('priceCurrency').optional().isString().withMessage('Price currency must be a string'),
  body('invoiceId').optional().isString().withMessage('Invoice ID must be a string'),
  body('successUrl').optional().isURL().withMessage('Success URL must be a valid URL'),
  body('cancelUrl').optional().isURL().withMessage('Cancel URL must be a valid URL')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Please check your input data',
      details: errors.array()
    });
  }

  const { 
    amount, 
    payCurrency, 
    priceCurrency = 'usd', 
    invoiceId,
    successUrl,
    cancelUrl 
  } = req.body;
  const userId = req.user.id;

  try {
    // Get user details
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User Error',
        message: 'User not found'
      });
    }

    // Get deposit wallet
    const depositWallet = await Wallet.findOne({
      where: { userId, walletType: 'deposit' }
    });

    if (!depositWallet) {
      return res.status(500).json({
        error: 'Wallet Error',
        message: 'Deposit wallet not found'
      });
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
      referenceId: `NOW_INV_${Date.now()}_${userId}`,
      description: `Invoice payment via NOWPayments - ${payCurrency.toUpperCase()}`
    });

    // Create invoice payment with NOWPayments
    const paymentData = {
      amount: parseFloat(amount),
      priceCurrency,
      payCurrency: payCurrency.toLowerCase(),
      orderId: transaction.referenceId,
      orderDescription: `Invoice payment for user ${user.memberId || user.id}`,
      ipnCallbackUrl: `${process.env.BACKEND_URL}/api/nowpayments/webhook`,
      isFixedRate: true,
      isFeePaidByUser: true,
      successUrl: successUrl || `${process.env.FRONTEND_URL}/payment/success`,
      cancelUrl: cancelUrl || `${process.env.FRONTEND_URL}/payment/cancel`
    };

    const payment = await nowpaymentsService.createInvoicePayment(paymentData);

    // Update transaction with payment details
    await transaction.update({
      gatewayResponse: JSON.stringify(payment),
      cryptoAddress: payment.pay_address,
      transactionHash: payment.payment_id
    });

    res.json({
      message: 'Invoice payment created successfully',
      payment: {
        paymentId: payment.payment_id,
        payAddress: payment.pay_address,
        payAmount: payment.pay_amount,
        payCurrency: payment.pay_currency,
        priceAmount: payment.price_amount,
        priceCurrency: payment.price_currency,
        orderId: payment.order_id,
        status: payment.payment_status,
        transactionId: transaction.id,
        referenceId: transaction.referenceId,
        invoiceId: payment.invoice_id
      }
    });
  } catch (error) {
    console.error('Invoice payment creation error:', error);
    res.status(500).json({
      error: 'Payment Error',
      message: error.message
    });
  }
}));

// Get payment button data (public endpoint - no authentication required)
router.get('/payment-button/:invoiceId', asyncHandler(async (req, res) => {
  const { invoiceId } = req.params;
  const { style = 'white' } = req.query;

  console.log('🔍 Payment button request (public):', { 
    invoiceId, 
    style, 
    origin: req.headers.origin,
    method: req.method,
    url: req.url
  });

  try {
    const buttonData = nowpaymentsService.getPaymentButtonData(invoiceId, style);
    console.log('✅ Payment button data generated:', buttonData);
    res.json({
      message: 'Payment button data retrieved successfully',
      buttonData
    });
  } catch (error) {
    console.error('❌ Payment button error:', error);
    res.status(500).json({
      error: 'Service Error',
      message: error.message
    });
  }
}));

// Get payment button HTML (public endpoint - no authentication required)
router.get('/payment-button-html/:invoiceId', asyncHandler(async (req, res) => {
  const { invoiceId } = req.params;
  const { style = 'white' } = req.query;

  console.log('🔍 Payment button HTML request (public):', { invoiceId, style });

  try {
    const buttonHtml = nowpaymentsService.generatePaymentButton(invoiceId, style);
    res.json({
      message: 'Payment button HTML generated successfully',
      buttonHtml
    });
  } catch (error) {
    res.status(500).json({
      error: 'Service Error',
      message: error.message
    });
  }
}));

export default router; 