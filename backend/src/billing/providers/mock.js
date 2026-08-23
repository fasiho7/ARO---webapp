const { HttpError } = require("../../utils/httpError");
const { isMockEnabled } = require("../../config/billing");

const OUTCOMES = ["successful", "failed", "cancelled"];

function isAvailable() {
  return isMockEnabled();
}

function assertEnabled() {
  if (!isAvailable()) {
    throw new HttpError(
      403,
      "Mock checkout is disabled outside development.",
      "MOCK_DISABLED",
    );
  }
}

async function createPayment(order) {
  assertEnabled();
  return {
    providerReference: `mock_${order.id}`,
    checkout: {
      type: "mock",
      live: false,
      message:
        "Development checkout only. This does not move money. Simulate a result on the server.",
    },
  };
}

async function verifyPayment(order, payload) {
  assertEnabled();
  const outcome =
    typeof payload?.outcome === "string" ? payload.outcome.trim() : "";
  if (!OUTCOMES.includes(outcome)) {
    throw new HttpError(
      400,
      "Mock checkout needs a result: successful, failed, or cancelled.",
    );
  }

  return {
    status: outcome,
    providerReference: order.provider_reference || `mock_${order.id}`,
    amount: Number(order.amount),
    currency: order.currency,
    failureReason:
      outcome === "failed"
        ? "Mock payment failed."
        : outcome === "cancelled"
          ? "Mock payment cancelled."
          : null,
  };
}

async function handleCallback() {
  throw new HttpError(400, "Mock checkout does not use provider callbacks.");
}

module.exports = {
  id: "mock",
  label: "Test checkout",
  description: "Development only. Does not charge anyone.",
  live: false,
  isAvailable,
  createPayment,
  verifyPayment,
  handleCallback,
  create: createPayment,
  verify: verifyPayment,
};
