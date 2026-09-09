/**
 * Email service — sends transactional emails via the Resend API.
 * No extra package required: uses the Node.js built-in fetch (Node 18+).
 *
 * Required env vars in backend/.env:
 *   RESEND_API_KEY=re_xxxxxxxxxxxx          (get from resend.com — free tier)
 *   EMAIL_FROM=Aro <noreply@yourdomain.com> (must be a verified sender in Resend)
 *   ADMIN_EMAIL=fasihzeeshan505@gmail.com   (where payment notifications go)
 */

const RESEND_API_URL = "https://api.resend.com/emails";

function isConfigured() {
  const key = (process.env.RESEND_API_KEY || "").trim();
  return key.length > 0 && key.startsWith("re_");
}

function fromAddress() {
  return (process.env.EMAIL_FROM || "Aro <noreply@aro.app>").trim();
}

function adminEmail() {
  return (process.env.ADMIN_EMAIL || "fasihzeeshan505@gmail.com").trim();
}

/**
 * Send a single email via Resend.
 * Silently logs and returns false if RESEND_API_KEY is not configured,
 * so missing email config never crashes the payment flow.
 */
async function sendEmail({ to, subject, html }) {
  if (!isConfigured()) {
    console.warn(
      "[emailService] RESEND_API_KEY is not set — skipping email to",
      to,
    );
    return false;
  }

  const apiKey = process.env.RESEND_API_KEY.trim();

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress(),
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "(no body)");
      console.error(
        `[emailService] Resend API error ${response.status}:`,
        body,
      );
      return false;
    }

    return true;
  } catch (err) {
    console.error("[emailService] Failed to send email:", err?.message ?? err);
    return false;
  }
}

/**
 * Notify the admin that a new payment proof has been submitted and is
 * waiting for review in the Aro Admin Dashboard.
 */
async function sendProofSubmittedEmail({
  userName,
  userEmail,
  amount,
  currency,
  provider,
  paymentId,
  createdAt,
}) {
  const dateStr = new Date(createdAt || Date.now()).toLocaleString("en-PK", {
    timeZone: "Asia/Karachi",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const providerLabel =
    provider === "bank"
      ? "Bank Transfer"
      : provider === "easypaisa"
        ? "Easypaisa"
        : provider === "jazzcash"
          ? "JazzCash"
          : provider === "mock"
            ? "Test (Mock)"
            : provider;

  const subject = `[Aro] New Payment Proof — ${currency} ${amount} via ${providerLabel}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><style>
  body { font-family: Arial, sans-serif; color: #1a1a1a; margin: 0; padding: 0; background: #f5f5f5; }
  .container { max-width: 560px; margin: 32px auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0; }
  .header { background: #1a1a1a; color: #f5c842; padding: 24px 32px; }
  .header h1 { margin: 0; font-size: 20px; }
  .header p { margin: 4px 0 0; font-size: 13px; color: #ccc; }
  .body { padding: 28px 32px; }
  .badge { display: inline-block; background: #fff3cd; color: #856404; border: 1px solid #ffc107; border-radius: 4px; padding: 3px 10px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  td { padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
  td:first-child { color: #666; width: 180px; }
  td:last-child { color: #1a1a1a; font-weight: 500; }
  .cta { display: block; margin: 24px 0 0; background: #f5c842; color: #1a1a1a; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; text-align: center; font-size: 15px; }
  .footer { padding: 16px 32px; font-size: 12px; color: #999; border-top: 1px solid #f0f0f0; }
</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>Aro — New Payment Proof Submitted</h1>
    <p>A user has submitted proof for a PKR ${amount} Pro upgrade.</p>
  </div>
  <div class="body">
    <span class="badge">⏳ Pending Review</span>
    <table>
      <tr><td>User Name</td><td>${escapeHtml(userName || "Not provided")}</td></tr>
      <tr><td>User Email</td><td>${escapeHtml(userEmail || "Not available")}</td></tr>
      <tr><td>Amount</td><td>${currency} ${amount}</td></tr>
      <tr><td>Payment Method</td><td>${escapeHtml(providerLabel)}</td></tr>
      <tr><td>Date / Time</td><td>${escapeHtml(dateStr)}</td></tr>
      <tr><td>Payment ID</td><td><code style="font-size:12px">${escapeHtml(paymentId)}</code></td></tr>
      <tr><td>Status</td><td><strong style="color:#856404">Pending</strong></td></tr>
    </table>
    <p style="font-size:14px;color:#444">
      Review this payment in the Aro Admin Dashboard. You can view the proof screenshot, then <strong>Approve</strong> (grants Pro immediately) or <strong>Reject</strong> (keeps user on Free).
    </p>
    <a class="cta" href="${(process.env.CLIENT_URL || "http://localhost:3000").replace(/\/$/, "")}/admin/payments">
      Open Admin Dashboard →
    </a>
  </div>
  <div class="footer">
    This email was sent automatically by Aro when a user submitted a payment proof.<br>
    Do not reply to this email.
  </div>
</div>
</body>
</html>
  `.trim();

  return sendEmail({
    to: adminEmail(),
    subject,
    html,
  });
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

module.exports = {
  isConfigured,
  sendEmail,
  sendProofSubmittedEmail,
};
