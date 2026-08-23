const { HttpError } = require("../../utils/httpError");
const { configured, readEnv } = require("../../config/payments");

function instructions() {
  const accountName =
    readEnv("BANK_ACCOUNT_NAME") || readEnv("BANK_ACCOUNT_TITLE");
  return {
    bankName: readEnv("BANK_NAME"),
    accountName,
    accountNumber: readEnv("BANK_ACCOUNT_NUMBER"),
    iban: readEnv("BANK_IBAN"),
  };
}

function isAvailable() {
  return true;
}

function missingVariables() {
  const missing = [];
  if (!configured(readEnv("BANK_NAME"))) missing.push("BANK_NAME");
  const accountName =
    readEnv("BANK_ACCOUNT_NAME") || readEnv("BANK_ACCOUNT_TITLE");
  if (!configured(accountName)) {
    missing.push("BANK_ACCOUNT_NAME");
  }
  if (!configured(readEnv("BANK_ACCOUNT_NUMBER"))) missing.push("BANK_ACCOUNT_NUMBER");
  if (!configured(readEnv("BANK_IBAN"))) missing.push("BANK_IBAN");
  if (!configured(readEnv("BILLING_ADMIN_SECRET"))) missing.push("BILLING_ADMIN_SECRET");
  return missing;
}

async function createPayment(order) {
  return {
    providerReference: `bank_${order.id}`,
    checkout: {
      type: "manual_transfer",
      live: false,
      message:
        "Send PKR 499 to the bank account below. After completing the payment, upload your payment screenshot and enter your transaction/reference ID.",
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
      "A bank transfer cannot upgrade Pro until it is verified by Aro.",
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
          ? payload.reason || "Bank transfer was rejected."
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
  throw new HttpError(400, "Bank transfers are verified manually, not by callback.");
}

module.exports = {
  id: "bank",
  label: "Bank / local",
  description: isAvailable()
    ? "Pay by bank transfer. Pro starts after Aro confirms the deposit."
    : "Needs bank account details. Transfers are never auto-approved.",
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
