const jazzcashCore = require("./jazzcashCore");

function isAvailable() {
  return false;
}

async function createPayment(order) {
  const hosted = jazzcashCore.buildHostedFields(order, {
    txnType: process.env.JAZZCASH_TXN_TYPE || "",
    returnPath: "/api/billing/callbacks/jazzcash",
  });
  return {
    providerReference: hosted.providerReference,
    checkout: hosted.checkout,
    launch: { action: hosted.action, fields: hosted.fields },
  };
}

async function verifyPayment(order, payload) {
  if (payload && typeof payload === "object" && (payload.pp_SecureHash || payload.pp_TxnRefNo)) {
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
    failureReason: null,
  };
}

async function handleCallback(payload) {
  return jazzcashCore.parseCallback(payload);
}

module.exports = {
  id: "jazzcash",
  label: "JazzCash",
  description: "Coming soon — manual verification will be enabled in a future update.",
  live: false,
  isAvailable,
  missingVariables: jazzcashCore.missingVariables,
  createPayment,
  verifyPayment,
  handleCallback,
  create: createPayment,
  verify: verifyPayment,
};
