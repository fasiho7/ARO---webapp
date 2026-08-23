const { HttpError } = require("../../utils/httpError");
const { configured, readEnv } = require("../../config/payments");

function instructions() {
  return {
    accountName: readEnv("EASYPAISA_ACCOUNT_NAME"),
    accountNumber: readEnv("EASYPAISA_ACCOUNT_NUMBER"),
  };
}

function isAvailable() {
  return true;
}

function missingVariables() {
  const missing = [];
  if (!configured(readEnv("EASYPAISA_ACCOUNT_NAME"))) missing.push("EASYPAISA_ACCOUNT_NAME");
  if (!configured(readEnv("EASYPAISA_ACCOUNT_NUMBER"))) missing.push("EASYPAISA_ACCOUNT_NUMBER");
  if (!configured(readEnv("BILLING_ADMIN_SECRET"))) missing.push("BILLING_ADMIN_SECRET");
  return missing;
}

async function createPayment(order) {
  return {
    providerReference: `easypaisa_${order.id}`,
    checkout: {
      type: "manual_transfer",
      live: false,
      message:
        "Send PKR 499 to the Easypaisa account below. After completing the payment, upload your payment screenshot and enter your transaction/reference ID.",
      instructions: instructions(),
    },
  };
}

async function verifyPayment(order, payload) {
  const outcome =
    typeof payload?.outcome === "string" ? payload.outcome.trim() : "";
  if (outcome === "successful" && payload?.source !== "admin") {
    throw new HttpError(
      403,
      "An Easypaisa transfer cannot upgrade Pro until it is verified by Aro.",
      "MANUAL_VERIFY_REQUIRED",
    );
  }
  if (payload?.source === "admin" && (outcome === "successful" || outcome === "failed")) {
    return {
      status: outcome,
      providerReference: order.provider_reference,
      providerTransactionId: order.provider_transaction_id,
      amount: Number(order.amount),
      currency: order.currency,
      failureReason:
        outcome === "failed"
          ? payload.reason || "Easypaisa transfer was rejected."
          : null,
    };
  }
  return {
    status: "pending",
    providerReference: order.provider_reference,
    amount: Number(order.amount),
    currency: order.currency,
  };
}

async function handleCallback() {
  throw new HttpError(400, "Easypaisa manual transfers are verified manually, not by callback.");
}

module.exports = {
  id: "easypaisa",
  label: "Easypaisa",
  description: isAvailable()
    ? "Pay via Easypaisa wallet transfer. Pro starts after Aro confirms the transaction."
    : "Needs Easypaisa account details. Transfers are never auto-approved.",
  live: false,
  isAvailable,
  missingVariables,
  createPayment,
  verifyPayment,
  handleCallback,
  create: createPayment,
  verify: verifyPayment,
  instructions,
};
