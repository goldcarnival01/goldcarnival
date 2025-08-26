import Wallet from '../../models/Wallet.js';
import Transaction from '../../models/Transaction.js';
import User from '../../models/User.js';
import Plan from '../../models/Plan.js';
import UserPlan from '../../models/UserPlan.js';
import nowpaymentsService from '../../services/nowpaymentsService.js';
import { sendEmail } from '../../services/emailService.js';

// Public webhook handler, HMAC-validated via x-nowpayments-sig
export default async function nowpaymentsWebhookHandler(req, res) {
  const signature = req.headers['x-nowpayments-sig'];
  const payload = req.body;

  try {
    if (!nowpaymentsService.validateWebhookSignature(payload, signature)) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const webhookData = nowpaymentsService.processWebhookData(payload);

    const transaction = await Transaction.findOne({
      where: { referenceId: webhookData.orderId }
    });

    if (!transaction) {
      console.error('Transaction not found for order ID:', webhookData.orderId);
      return res.status(404).json({ error: 'Transaction not found' });
    }

    switch (webhookData.paymentStatus) {
      case 'confirmed':
      case 'finished': {
        console.log('🎉 Payment confirmed! Processing plan assignment...');
        await transaction.update({
          status: 'completed',
          processedAt: new Date(),
          gatewayResponse: JSON.stringify(webhookData)
        });

        let planMetadata = null;
        try {
          if (transaction.metadata) planMetadata = JSON.parse(transaction.metadata);
        } catch (err) {
          console.error('Error parsing transaction metadata:', err);
        }

        if (planMetadata && planMetadata.planId) {
          try {
            console.log('📋 Creating UserPlan entry for plan:', planMetadata.planId);
            const plan = await Plan.findByPk(planMetadata.planId);
            if (plan) {
              const existingPlan = await UserPlan.findOne({
                where: {
                  userId: transaction.userId,
                  planId: planMetadata.planId,
                  status: 'active',
                  isActive: true
                }
              });

              if (existingPlan) {
                const newExpiryDate = new Date(existingPlan.expiryDate);
                newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
                await existingPlan.update({
                  expiryDate: newExpiryDate,
                  notes: `Extended via crypto payment - ${new Date().toISOString()}`
                });
              } else {
                const expiryDate = new Date();
                expiryDate.setFullYear(expiryDate.getFullYear() + 1);
                await UserPlan.create({
                  userId: transaction.userId,
                  planId: planMetadata.planId,
                  purchasePrice: transaction.amount,
                  expiryDate,
                  paymentMethod: 'crypto',
                  transactionId: transaction.referenceId,
                  status: 'active',
                  isActive: true,
                  notes: 'Purchased via NOWPayments crypto payment'
                });
              }
            }
          } catch (err) {
            console.error('❌ Error creating UserPlan:', err);
          }
        } else {
          // Regular deposit path
          const wallet = await Wallet.findByPk(transaction.walletId);
          if (wallet) await wallet.addBalance(transaction.amount);
        }

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
          await sendEmail({ to: user.email, template: 'deposit', data });
        }
        break;
      }

      case 'failed':
      case 'expired': {
        console.log('❌ Payment failed! Updating transaction status...');
        await transaction.update({
          status: 'failed',
          processedAt: new Date(),
          gatewayResponse: JSON.stringify(webhookData)
        });

        const failedUser = await User.findByPk(transaction.userId);
        if (failedUser) {
          const subject = 'Payment Failed';
          const failureReason = webhookData.paymentStatus === 'expired' ? 'Payment expired' : 'Payment failed';
          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style=\"color: #ff4d4f;\">Payment Failed</h2>
              <p>Hello ${failedUser.firstName || failedUser.memberId},</p>
              <p>Your crypto payment could not be completed.</p>
              <p><strong>Reason:</strong> ${failureReason}</p>
              <p><strong>Amount:</strong> $${transaction.amount}</p>
              <p><strong>Transaction ID:</strong> ${transaction.referenceId}</p>
            </div>
          `;
          await sendEmail({ to: failedUser.email, subject, html, text: `Payment failed (${failureReason}). Amount: $${transaction.amount}. Transaction: ${transaction.referenceId}.` });
        }
        break;
      }

      case 'pending':
        await transaction.update({ status: 'pending', gatewayResponse: JSON.stringify(webhookData) });
        break;

      default:
        console.log('Unknown payment status:', webhookData.paymentStatus);
    }

    return res.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}


