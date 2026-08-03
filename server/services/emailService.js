const config = require('../config/env');
const logger = require('../utils/logger');

let transporter = null;

const initializeEmailService = async () => {
  if (config.sendgridApiKey) {
    try {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(config.sendgridApiKey);
      transporter = {
        send: async (options) => {
          await sgMail.send(options);
        }
      };
      logger.info('SendGrid email service initialized');
      return;
    } catch (error) {
      logger.warn('SendGrid not available, falling back to console');
    }
  }

  // Fallback: Use nodemailer if SMTP configured, otherwise log to console
  try {
    const nodemailer = require('nodemailer');
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    });
    logger.info('Nodemailer email service initialized');
  } catch (error) {
    logger.warn('Email service not configured. Emails will be logged to console.');
    transporter = null;
  }
};

const sendEmail = async ({ to, subject, html, text }) => {
  const mailOptions = {
    from: config.emailFrom,
    to,
    subject,
    html,
    text
  };

  if (transporter) {
    try {
      await transporter.send(mailOptions);
      logger.info(`Email sent to ${to}: ${subject}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error.message);
      return false;
    }
  }

  // Fallback: Log to console
  logger.info(`[EMAIL LOG] To: ${to} | Subject: ${subject}`);
  if (html) logger.info(`[EMAIL LOG] HTML: ${html.substring(0, 200)}...`);
  return true;
};

const sendPasswordResetOTP = async (email, otp) => {
  const html = getPasswordResetTemplate(otp);
  return sendEmail({
    to: email,
    subject: 'NexPlay - Password Reset OTP',
    html
  });
};

const sendVerificationNotification = async (email, companyName, status, reason = '') => {
  let subject, html;

  if (status === 'verified') {
    subject = 'NexPlay - Company Verified Successfully';
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #D4A017;">Congratulations ${companyName}!</h2>
        <p>Your company has been <strong style="color: #22C55E;">verified</strong> successfully.</p>
        <p>You now have access to all features including advertisements, campaigns, and content publishing.</p>
        <p>Log in to your dashboard to get started.</p>
        <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
          <p style="margin: 0; font-size: 12px; color: #666;">NexPlay - Entertainment Discovery Platform</p>
        </div>
      </div>
    `;
  } else if (status === 'rejected') {
    subject = 'NexPlay - Company Verification Rejected';
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #EF4444;">Verification Update</h2>
        <p>Dear ${companyName},</p>
        <p>Your company verification request has been <strong style="color: #EF4444;">rejected</strong>.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>You can update your profile and re-submit for verification.</p>
        <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
          <p style="margin: 0; font-size: 12px; color: #666;">NexPlay - Entertainment Discovery Platform</p>
        </div>
      </div>
    `;
  }

  return sendEmail({ to: email, subject, html });
};

const getPasswordResetTemplate = (otp) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #D4A017;">NexPlay Password Reset</h2>
      <p>You have requested to reset your password.</p>
      <p>Your OTP code is:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #D4A017; padding: 15px 25px; background-color: #f5f5f5; border-radius: 8px;">
          ${otp}
        </span>
      </div>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
      <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
        <p style="margin: 0; font-size: 12px; color: #666;">NexPlay - Entertainment Discovery Platform</p>
      </div>
    </div>
  `;
};

module.exports = {
  initializeEmailService,
  sendEmail,
  sendPasswordResetOTP,
  sendVerificationNotification
};
