const nodemailer = require('nodemailer');

/**
 * Creates nodemailer SMTP transporter based on environment configuration.
 */
function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT, 10) || 465;
  const secure = port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : undefined;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    connectionTimeout: 4000,
    greetingTimeout: 4000,
    socketTimeout: 5000,
    auth: (user && pass) ? { user, pass } : undefined,
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    }
  });
}

/**
 * Send an email using SMTP or simulated dry-run.
 *
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} [options.html] - HTML content
 * @returns {Promise<Object>}
 */
async function sendMail({ to, subject, text, html }) {
  const isDryRun = process.env.EMAIL_DRY_RUN === 'true';

  if (isDryRun) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[EMAIL DRY RUN]', { to, subject, message: text });
    }
    return {
      messageId: `dry-run-${Date.now()}`,
      accepted: [to],
      rejected: [],
      channel: 'dry-run'
    };
  }

  if (!process.env.SMTP_PASS) {
    throw new Error('SMTP credentials not configured: missing SMTP_PASS');
  }

  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@insighterp.edu';
  const transporter = createTransporter();

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html: html || text
  });

  return {
    ...info,
    channel: 'smtp'
  };
}

/**
 * Helper to send OTP verification email.
 */
async function sendOtpEmail(to, code) {
  const subject = 'Your InsightERP Verification Code';
  const text = `Your login verification code is: ${code}\n\nThis code will expire in ${Math.round((parseInt(process.env.OTP_TTL_SECONDS, 10) || 300) / 60)} minutes.\nIf you did not request this code, please ignore this email.`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #1f2937;">
      <h2 style="color: #6366f1;">InsightERP Security Verification</h2>
      <p>Use the following single-use verification code to complete your login:</p>
      <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; padding: 12px 24px; background: #f3f4f6; border-radius: 8px; display: inline-block; margin: 16px 0;">
        ${code}
      </div>
      <p style="color: #6b7280; font-size: 14px;">This code is valid for ${Math.round((parseInt(process.env.OTP_TTL_SECONDS, 10) || 300) / 60)} minutes and can only be used once.</p>
    </div>
  `;

  return await module.exports.sendMail({ to, subject, text, html });
}

module.exports = {
  createTransporter,
  sendMail,
  sendOtpEmail
};
