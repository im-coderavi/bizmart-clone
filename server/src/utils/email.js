import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

/**
 * Sends an email. If SMTP is not configured, the email is logged to the
 * console so flows still work in development.
 */
export async function sendEmail({ to, subject, html, text }) {
  const t = getTransporter();
  const from = process.env.MAIL_FROM || "Digital Marketplace <no-reply@marketplace.com>";
  if (!t) {
    console.log("📧 [EMAIL - console mode]");
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   ${text || html?.replace(/<[^>]+>/g, " ")}`);
    return { mocked: true };
  }
  return t.sendMail({ from, to, subject, html, text });
}

export const templates = {
  welcome: (name) => ({
    subject: "Welcome to Digital Marketplace 🎉",
    html: `<h2>Welcome, ${name}!</h2><p>Your account is ready. Browse thousands of premium themes & plugins.</p>`,
  }),
  membershipActivated: (name, planName, expires) => ({
    subject: "Your membership is active ✅",
    html: `<h2>Hi ${name},</h2><p>Your <b>${planName}</b> membership is now active.${
      expires ? ` It is valid until <b>${new Date(expires).toDateString()}</b>.` : " Enjoy lifetime access!"
    }</p><p>You can now download unlimited products.</p>`,
  }),
  paymentSuccess: (name, amount, planName) => ({
    subject: "Payment received 💳",
    html: `<h2>Hi ${name},</h2><p>We received your payment of <b>₹${amount}</b> for <b>${planName}</b>. Thank you!</p>`,
  }),
  paymentSubmitted: (name, amount, planName) => ({
    subject: "We received your payment details ⏳",
    html: `<h2>Hi ${name},</h2><p>Thanks! We've received your payment details (₹${amount} for <b>${planName}</b>). Our team will verify it shortly and activate your membership. You'll get a confirmation email once approved.</p>`,
  }),
  paymentApproved: (name, amount, planName) => ({
    subject: "Payment verified — membership active ✅",
    html: `<h2>Hi ${name},</h2><p>Good news! Your payment of <b>₹${amount}</b> for <b>${planName}</b> has been verified and your membership is now <b>active</b>. You can now download unlimited products. Enjoy! 🎉</p>`,
  }),
  productPurchased: (name, productName, version, downloadLink) => ({
    subject: `Your download is ready — ${productName} ✅`,
    html: `<h2>Hi ${name},</h2>
      <p>Your payment has been verified. Thank you for purchasing <b>${productName}</b>${
        version ? ` (v${version})` : ""
      }.</p>
      <p><b>Download link:</b><br/>
      <a href="${downloadLink}" style="display:inline-block;margin-top:8px;padding:10px 18px;background:#5529ed;color:#fff;border-radius:6px;text-decoration:none">⬇ Download ${productName}</a></p>
      <p style="color:#666;font-size:13px;margin-top:14px">Or copy this link: ${downloadLink}</p>
      <p>You can also re-download it anytime from your dashboard.</p>`,
  }),
  paymentRejected: (name, planName, reason) => ({
    subject: "Action needed on your payment ⚠️",
    html: `<h2>Hi ${name},</h2><p>We could not verify your recent payment for <b>${planName}</b>.${
      reason ? ` Reason: <b>${reason}</b>.` : ""
    }</p><p>Please re-check your UTR/transaction details and try again, or contact support for help.</p>`,
  }),
  resetPassword: (name, link) => ({
    subject: "Reset your password",
    html: `<h2>Hi ${name},</h2><p>Click below to reset your password (valid 1 hour):</p><p><a href="${link}">${link}</a></p>`,
  }),
};
