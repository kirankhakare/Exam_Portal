import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

/**
 * Robust email sender.
 * - Supports generic SMTP via env vars.
 * - Skips sending if SMTP not configured, but logs clearly.
 *
 * Required env vars (recommended):
 * SMTP_HOST, SMTP_PORT, SMTP_SECURE (true/false), SMTP_USER, SMTP_PASS, FROM_EMAIL
 *
 * Backwards-compatible with your previous EMAIL_USER / EMAIL_PASS if present.
 */

const SMTP_HOST = process.env.SMTP_HOST || process.env.EMAIL_HOST || "smtp.gmail.com";
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : (process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 465);
const SMTP_SECURE = (process.env.SMTP_SECURE || process.env.EMAIL_SECURE || "true") === "true";
const SMTP_USER = process.env.SMTP_USER || process.env.EMAIL_USER;
const SMTP_PASS = process.env.SMTP_PASS || process.env.EMAIL_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER || process.env.EMAIL_USER;

let transporter = null;

if (SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
} else {
  console.warn("SMTP not fully configured (SMTP_USER/SMTP_PASS missing). Emails will be skipped.");
}

/**
 * Send result email with optional PDF buffer attachment.
 * Returns info object from nodemailer or throws on fatal error.
 */
const sendResultEmail = async (toEmail, studentName, examTitle, pdfBuffer) => {
  if (!transporter) {
    console.warn("Skipping email send - transporter not configured.");
    return;
  }

  const mailOptions = {
    from: FROM_EMAIL,
    to: toEmail,
    subject: `Your Exam Result - ${examTitle}`,
    text: `Hello ${studentName},

Your exam result for "${examTitle}" is attached as a PDF.

Regards,
Exam Portal`,
    attachments: [],
  };

  if (pdfBuffer) {
    mailOptions.attachments.push({
      filename: `${(examTitle || "result").replace(/\s+/g, "_")}_result.pdf`,
      content: pdfBuffer,
      contentType: "application/pdf",
    });
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Result email sent to ${toEmail} (messageId: ${info.messageId})`);
    return info;
  } catch (err) {
    console.error("Error sending result email:", err);
    // bubble up error so caller can log/handle if necessary
    throw err;
  }
};

export default sendResultEmail;
