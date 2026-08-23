const PRODUCT_ID = "aro_pro";
const PRODUCT_NAME = "Aro Pro";
const DEFAULT_AMOUNT = 499;
const DEFAULT_CURRENCY = "PKR";

const PROVIDER_IDS = ["mock", "easypaisa", "jazzcash", "card", "bank"];
const STATUSES = ["pending", "successful", "failed", "cancelled"];
const TERMINAL_STATUSES = ["successful", "failed", "cancelled"];

function parseAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    return DEFAULT_AMOUNT;
  }
  return Math.round(amount * 100) / 100;
}

function productCatalog() {
  const currency = (process.env.PRO_PRICE_CURRENCY || DEFAULT_CURRENCY)
    .trim()
    .toUpperCase();
  return {
    id: PRODUCT_ID,
    name: PRODUCT_NAME,
    amount: parseAmount(process.env.PRO_PRICE_AMOUNT),
    currency: currency.length >= 3 ? currency : DEFAULT_CURRENCY,
    interval: "month",
  };
}

function isMockEnabled() {
  const { isProductionPayments } = require("./payments");
  const flag = (process.env.BILLING_MOCK_ENABLED || "").trim().toLowerCase();
  if (flag === "false" || flag === "0") {
    return false;
  }
  if (flag === "true" || flag === "1") {
    return true;
  }
  return !isProductionPayments();
}

function isKnownProvider(id) {
  return PROVIDER_IDS.includes(id);
}

function isKnownStatus(status) {
  return STATUSES.includes(status);
}

function isTerminalStatus(status) {
  return TERMINAL_STATUSES.includes(status);
}

module.exports = {
  PRODUCT_ID,
  PRODUCT_NAME,
  PROVIDER_IDS,
  STATUSES,
  productCatalog,
  isMockEnabled,
  isKnownProvider,
  isKnownStatus,
  isTerminalStatus,
};
