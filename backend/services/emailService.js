const nodemailer = require('nodemailer');

let transporter = null;
let isEthereal = false;

/**
 * Initialize Nodemailer transporter.
 * If custom SMTP credentials exist in .env, uses them.
 * Otherwise, generates an Ethereal test account automatically.
 */
const initializeTransporter = async () => {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;

  if (SMTP_HOST && SMTP_USER && SMTP_PASSWORD) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });
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
    console.log(`💡 Note: To send real emails to inbox (e.g. Gmail), set SMTP_USER and SMTP_PASSWORD (App Password) in backend/.env`);
    return transporter;
  } catch (err) {
    console.error('Failed to create Ethereal test account:', err.message);
    return null;
  }
};

/**
 * Send an email.
 * Returns { success: true, messageId, previewUrl } or { success: false, error }
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
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
    console.error(`❌ Email send failed to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail, initializeTransporter };
