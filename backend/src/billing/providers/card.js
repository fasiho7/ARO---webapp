const jazzcashCore = require("./jazzcashCore");
const easypaisaCore = require("./easypaisaCore");
const { readEnv } = require("../../config/payments");

function gateway() {
  const explicit = readEnv("CARD_GATEWAY").toLowerCase();
  if (explicit === "jazzcash" || explicit === "easypaisa") {
    return explicit;
  }
  if (jazzcashCore.isConfigured() && jazzcashCore.checkoutUrl()) {
    return "jazzcash";
  }
  if (easypaisaCore.isConfigured()) {
    return "easypaisa";
  }
  return "";
}

function isAvailable() {
  const selected = gateway();
  if (selected === "jazzcash") {
    return jazzcashCore.isConfigured() && Boolean(jazzcashCore.checkoutUrl());
  }
  if (selected === "easypaisa") {
    return easypaisaCore.isConfigured();
  }
  return false;
}

function missingVariables() {
  const selected = gateway();
  if (selected === "easypaisa") {
    return easypaisaCore.missingVariables();
  }
  if (selected === "jazzcash") {
    return jazzcashCore.missingVariables();
  }
  return [
    "CARD_GATEWAY",
    "JAZZCASH_MERCHANT_ID",
    "JAZZCASH_PASSWORD",
    "JAZZCASH_INTEGRITY_SALT",
  ];
}

async function createPayment(order) {
  const selected = gateway();
  if (selected === "easypaisa") {
    const hosted = easypaisaCore.buildHostedFields(
      order,
      "CC_PAYMENT_METHOD",
      "/api/billing/callbacks/card",
    );
    return {
      providerReference: hosted.providerReference,
      checkout: hosted.checkout,
      launch: { action: hosted.action, fields: hosted.fields },
    };
  }
  const hosted = jazzcashCore.buildHostedFields(order, {
    txnType: readEnv("CARD_TXN_TYPE") || "",
    returnPath: "/api/billing/callbacks/card",
  });
  return {
    providerReference: hosted.providerReference,
    checkout: hosted.checkout,
    launch: { action: hosted.action, fields: hosted.fields },
  };
}

async function verifyPayment(order, payload) {
  const selected = gateway();
  if (selected === "easypaisa") {
    return require("./easypaisa").verifyPayment(order, payload);
  }
  if (payload && (payload.pp_SecureHash || payload.pp_TxnRefNo)) {
    return jazzcashCore.parseCallback(payload);
  }
  const inquired = await jazzcashCore.inquire(order);
  if (inquired) {
    return inquired;
  }
  return {
    status: "pending",
    providerReference: order.provider_reference,
    amount: Number(order.amount),
    currency: order.currency,
  };
}

async function handleCallback(payload) {
  if (gateway() === "easypaisa") {
    return require("./easypaisa").handleCallback(payload);
  }
  return jazzcashCore.parseCallback(payload);
}

module.exports = {
  id: "card",
  label: "Debit / Credit Card",
  description: isAvailable()
    ? "Card details are entered on the provider hosted page. Aro never stores card numbers or CVV."
    : "Needs a hosted card gateway (JazzCash MPGS or Easypaisa CC).",
  live: isAvailable(),
  isAvailable,
  missingVariables,
  createPayment,
  verifyPayment,
  handleCallback,
  create: createPayment,
  verify: verifyPayment,
};
