const nodemailer = require('nodemailer');

let transporter = null;
let isEthereal = false;

/**
 * Send email using Brevo (formerly Sendinblue) HTTP REST API (Port 443 - HTTPS)
 * Render free tier blocks outbound SMTP ports 25, 465, and 587.
 * Brevo sends over HTTPS (port 443), which is 100% unrestricted on Render.
 * Free tier: 300 emails/day to any recipient.
 */
const sendViaBrevo = async ({ to, subject, html, text }) => {
  const apiKey = (process.env.BREVO_API_KEY || '').trim();
  if (!apiKey) return null;

  const senderEmail = process.env.FROM_EMAIL || process.env.SMTP_USER || 'attendanceanveshak.system@gmail.com';
  const senderName = 'Technical Team Attendance';

  const maskedKey = apiKey.length > 15
    ? `${apiKey.slice(0, 10)}...${apiKey.slice(-4)} (len: ${apiKey.length})`
    : `(len: ${apiKey.length}, preview: ${apiKey.slice(0, 4)}...)`;
  console.log(`ℹ Attempting Brevo delivery with key: ${maskedKey} | sender: ${senderEmail}`);

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text || html.replace(/<[^>]+>/g, ''),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error(`❌ Brevo API returned HTTP ${response.status}:`, JSON.stringify(errorData));
    throw new Error(errorData.message || `Brevo API error status ${response.status}`);
  }

  const data = await response.json().catch(() => ({ messageId: 'brevo-sent' }));
  return { success: true, messageId: data.messageId || 'brevo-sent' };
};

/**
 * Send email using Resend HTTP REST API (Port 443 - HTTPS)
 */
const sendViaResend = async ({ to, subject, html, text }) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  const fromAddress = process.env.RESEND_FROM || 'Technical Team Attendance <onboarding@resend.dev>';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddress,
      to: [to],
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ''),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Resend API error status ${response.status}`);
  }

  const data = await response.json().catch(() => ({ id: 'resend-sent' }));
  return { success: true, messageId: data.id || 'resend-sent' };
};

/**
 * Send email using Google Apps Script Webhook (Port 443 - HTTPS)
 * Runs directly in Google Cloud using GmailApp/MailApp from the user's Gmail.
 */
const sendViaGoogleWebhook = async ({ to, subject, html, text }) => {
  const webhookUrl = process.env.GMAIL_WEBHOOK_URL;
  if (!webhookUrl) return null;

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ''),
      secret: process.env.GMAIL_WEBHOOK_SECRET || '',
    }),
  });

  if (!response.ok) {
    throw new Error(`Google Webhook error status ${response.status}`);
  }

  return { success: true, messageId: 'google-webhook-sent' };
};

/**
 * Initialize Nodemailer transporter.
 * Used for local development or paid cloud hosting where SMTP ports are open.
 */
const initializeTransporter = async () => {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;

  if (SMTP_HOST && SMTP_USER && SMTP_PASSWORD) {
    const isGmail = SMTP_HOST.includes('gmail');
    const portNum = Number(SMTP_PORT) || (isGmail ? 465 : 587);

    const transportConfig = isGmail
      ? {
          service: 'gmail',
          auth: {
            user: SMTP_USER,
            pass: SMTP_PASSWORD,
          },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
        }
      : {
          host: SMTP_HOST,
          port: portNum,
          secure: portNum === 465,
          auth: {
            user: SMTP_USER,
            pass: SMTP_PASSWORD,
          },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
        };

    transporter = nodemailer.createTransport(transportConfig);
    isEthereal = false;
    console.log(`✓ Custom SMTP Email Service initialized (${SMTP_USER})`);
    return transporter;
  }

  // Automatic Ethereal account fallback for zero-config email testing
  try {
    console.log('ℹ Custom SMTP credentials not set. Creating Ethereal test email account...');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    isEthereal = true;
    console.log(`✓ Ethereal Test Email Service ready! Sender: ${testAccount.user}`);
    return transporter;
  } catch (err) {
    console.error('Failed to create Ethereal test account:', err.message);
    return null;
  }
};

/**
 * Send an email.
 * Tries HTTPS-based APIs first (Brevo, Resend, Google Webhook) to bypass cloud SMTP blocks.
 * Falls back to Nodemailer SMTP.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // 1. Brevo HTTPS API (Recommended for Render free tier)
    if (process.env.BREVO_API_KEY) {
      const res = await sendViaBrevo({ to, subject, html, text });
      console.log(`\n📧 [EMAIL SENT VIA BREVO] To: ${to} | Subject: "${subject}"\n`);
      return res;
    }

    // 2. Resend HTTPS API
    if (process.env.RESEND_API_KEY) {
      const res = await sendViaResend({ to, subject, html, text });
      console.log(`\n📧 [EMAIL SENT VIA RESEND] To: ${to} | Subject: "${subject}"\n`);
      return res;
    }

    // 3. Google Apps Script Webhook (Sends directly through Gmail via HTTPS)
    if (process.env.GMAIL_WEBHOOK_URL) {
      const res = await sendViaGoogleWebhook({ to, subject, html, text });
      console.log(`\n📧 [EMAIL SENT VIA GOOGLE APPS SCRIPT] To: ${to} | Subject: "${subject}"\n`);
      return res;
    }

    // 4. Fallback to Nodemailer SMTP
    const mailer = await initializeTransporter();

    if (!mailer) {
      return {
        success: false,
        error: 'Email service could not be initialized.',
      };
    }

    const senderEmail = (process.env.SMTP_USER && process.env.SMTP_USER.trim() !== '')
      ? (process.env.FROM_EMAIL || process.env.SMTP_USER)
      : 'noreply@techteam.edu';

    const fromAddress = senderEmail.includes('<')
      ? senderEmail
      : `"Technical Team Attendance" <${senderEmail}>`;

    const info = await mailer.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ''),
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`\n📧 [ABSENT NOTIFICATION SENT] To: ${to}`);
      console.log(`   Subject: "${subject}"`);
      console.log(`   🔗 View Sent Email Preview: ${previewUrl}\n`);
    } else {
      console.log(`\n📧 [EMAIL DELIVERED TO INBOX] To: ${to} | Subject: "${subject}"\n`);
    }

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    const isTimeout = error.code === 'ETIMEDOUT' || (error.message && error.message.toLowerCase().includes('timeout'));
    if (isTimeout) {
      console.error(`\n❌ [SMTP TIMEOUT] Failed to send email to ${to}.`);
      console.error(`⚠️ Notice: Render's Free tier blocks outbound SMTP traffic on ports 25, 465, and 587.`);
      console.error(`💡 Solution: Add BREVO_API_KEY or GMAIL_WEBHOOK_URL in Render env vars to send via HTTPS (Port 443).\n`);
    } else {
      console.error(`❌ Email send failed to ${to}:`, error.message);
    }
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail, initializeTransporter };
