const { HttpError } = require("../../utils/httpError");
const core = require("./easypaisaCore");

function isAvailable() {
  return core.isConfigured();
}

async function createPayment(order) {
  const hosted = core.buildHostedFields(order);
  return {
    providerReference: hosted.providerReference,
    checkout: hosted.checkout,
    launch: { action: hosted.action, fields: hosted.fields },
  };
}

async function verifyPayment(order, payload) {
  const inquired = await core.inquire(order);
  if (inquired) {
    return inquired;
  }
  if (payload && (payload.status || payload.desc || payload.orderRefNum)) {
    const parsed = core.parseBrowserResult(payload);
    if (parsed.claimedSuccess) {
      throw new HttpError(
        409,
        "Easypaisa return URL is not proof of payment. Configure inquiry credentials (EASYPAISA_USERNAME, EASYPAISA_PASSWORD, EASYPAISA_ACCOUNT_NUM) so the server can verify the transaction.",
        "INQUIRE_REQUIRED",
      );
    }
    return {
      status: parsed.status || "pending",
      providerReference: parsed.providerReference || order.provider_reference,
      amount: Number(order.amount),
      currency: order.currency,
      failureReason: parsed.failureReason || null,
    };
  }
  return {
    status: "pending",
    providerReference: order.provider_reference,
    amount: Number(order.amount),
    currency: order.currency,
  };
}

async function handleCallback(payload) {
  const parsed = core.parseBrowserResult(payload);
  return {
    ...parsed,
    authToken: payload?.auth_token || payload?.authToken || null,
  };
}

module.exports = {
  id: "easypaisa",
  label: "Easypaisa",
  description: isAvailable()
    ? "Pay from Easypaisa on the official hosted checkout."
    : "Needs Easypaisa merchant credentials (sandbox first).",
  live: isAvailable(),
  isAvailable,
  missingVariables: core.missingVariables,
  createPayment,
  verifyPayment,
  handleCallback,
  create: createPayment,
  verify: verifyPayment,
};
