import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: process.env.MAIL_ENCRYPTION === 'tls',
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  }
});

// Email templates
const emailTemplates = {
  welcome: (data) => ({
    subject: 'Welcome to Gold Carnival!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FFD700;">Welcome to Gold Carnival!</h2>
        <p>Hello ${data.name},</p>
        <p>Welcome to Gold Carnival! Your account has been successfully created.</p>
        <p><strong>Member ID:</strong> ${data.memberId}</p>
        <p>You can now:</p>
        <ul>
          <li>Purchase lottery tickets</li>
          <li>Participate in jackpots</li>
          <li>Earn through referrals</li>
          <li>Manage your wallets</li>
        </ul>
        <p>Thank you for joining us!</p>
        <p>Best regards,<br>Gold Carnival Team</p>
      </div>
    `
  }),
  
  passwordReset: (data) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FFD700;">Password Reset Request</h2>
        <p>Hello ${data.name},</p>
        <p>You have requested to reset your password.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${data.resetLink}" style="background-color: #FFD700; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>Gold Carnival Team</p>
      </div>
    `
  }),
  
  ticketPurchase: (data) => ({
    subject: 'Ticket Purchase Confirmation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FFD700;">Ticket Purchase Confirmation</h2>
        <p>Hello ${data.name},</p>
        <p>Your ticket purchase has been confirmed!</p>
        <p><strong>Ticket Number:</strong> ${data.ticketNumber}</p>
        <p><strong>Jackpot:</strong> ${data.jackpotName}</p>
        <p><strong>Amount:</strong> $${data.amount}</p>
        <p>Good luck!</p>
        <p>Best regards,<br>Gold Carnival Team</p>
      </div>
    `
  }),
  
  winner: (data) => ({
    subject: 'Congratulations! You Won!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FFD700;">🎉 Congratulations! You Won! 🎉</h2>
        <p>Hello ${data.name},</p>
        <p>Congratulations! You have won the ${data.jackpotName}!</p>
        <p><strong>Winning Amount:</strong> $${data.amount}</p>
        <p><strong>Ticket Number:</strong> ${data.ticketNumber}</p>
        <p>Your winnings have been credited to your wallet.</p>
        <p>Best regards,<br>Gold Carnival Team</p>
      </div>
    `
  }),
  
  deposit: (data) => ({
    subject: 'Deposit Confirmation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FFD700;">Deposit Confirmation</h2>
        <p>Hello ${data.name},</p>
        <p>Your deposit has been confirmed!</p>
        <p><strong>Amount:</strong> $${data.amount}</p>
        <p><strong>Currency:</strong> ${data.currency}</p>
        <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
        <p>Your wallet has been updated.</p>
        <p>Best regards,<br>Gold Carnival Team</p>
      </div>
    `
  }),

  'email-verification': (data) => ({
    subject: 'Verify Your Email - Gold Carnival',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #FFD700;">
            <h1 style="color: #FFD700; margin: 0; font-size: 28px; font-weight: bold;">GOLD CARNIVAL</h1>
            <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Premium Lottery Platform</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px 20px;">
            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Verify Your Email Address</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
              Hello <strong>${data.name}</strong>,
            </p>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
              Thank you for registering with Gold Carnival! To complete your registration and start enjoying our premium lottery experience, please verify your email address.
            </p>
            
            <div style="background-color: #f8f9fa; border-left: 4px solid #FFD700; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #333; font-size: 14px;">
                <strong>Member ID:</strong> ${data.memberId}
              </p>
            </div>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 20px 0;">
              Click the button below to verify your email address:
            </p>
            
            <!-- Verification Button -->
            <div style="text-align: center; margin: 30px 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto;">
                <tr>
                  <td bgcolor="#FFD700" style="border-radius: 25px; text-align: center; mso-padding-alt: 0;">
                    <a href="${data.verificationUrl}" target="_blank" rel="noopener noreferrer"
                       style="display: inline-block; padding: 15px 30px; font-weight: bold; font-size: 16px; color: #000; text-decoration: none;">
                      ✓ VERIFY EMAIL ADDRESS
                    </a>
                  </td>
                </tr>
              </table>
            </div>
            
            <p style="color: #999; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="color: #007bff; font-size: 14px; word-break: break-all; margin: 5px 0 20px 0;">
              ${data.verificationUrl}
            </p>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>⚠️ Important:</strong> This verification link will expire in 24 hours and can only be used once.
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
              If you didn't create an account with Gold Carnival, please ignore this email.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="border-top: 1px solid #eee; padding: 20px; text-align: center; background-color: #f8f9fa;">
            <p style="color: #999; font-size: 14px; margin: 0 0 10px 0;">
              Best regards,<br>
              <strong style="color: #FFD700;">Gold Carnival Team</strong>
            </p>
            <p style="color: #ccc; font-size: 12px; margin: 0;">
              © 2025 Gold Carnival. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      GOLD CARNIVAL - Verify Your Email Address
      
      Hello ${data.name},
      
      Thank you for registering with Gold Carnival! 
      Member ID: ${data.memberId}
      
      To complete your registration, please verify your email address by visiting:
      ${data.verificationUrl}
      
      This verification link will expire in 24 hours and can only be used once.
      
      If you didn't create an account with Gold Carnival, please ignore this email.
      
      Best regards,
      Gold Carnival Team
      
      © 2025 Gold Carnival. All rights reserved.
    `
  })
};

// Send email function
export const sendEmail = async ({ to, subject, template, data, html, text }) => {
  try {
    let emailContent = {};
    
    if (template && emailTemplates[template]) {
      emailContent = emailTemplates[template](data);
    } else {
      emailContent = { subject, html, text };
    }

    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
      to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

// Verify email configuration
export const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email configuration verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Email configuration verification failed:', error);
    return false;
  }
}; 