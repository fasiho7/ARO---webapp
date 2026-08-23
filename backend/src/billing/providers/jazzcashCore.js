const { HttpError } = require("../../utils/httpError");
const {
  configured,
  isProductionPayments,
  paymentEnv,
  readEnv,
  apiOrigin,
  clientOrigin,
} = require("../../config/payments");
const { jazzcashSecureHash, jazzcashHashValid } = require("../jazzcashHash");
const { toPaisa, fromPaisa } = require("../shared");

function credentials() {
  return {
    merchantId: readEnv("JAZZCASH_MERCHANT_ID"),
    password: readEnv("JAZZCASH_PASSWORD"),
    integritySalt: readEnv("JAZZCASH_INTEGRITY_SALT"),
    checkoutUrl: readEnv("JAZZCASH_CHECKOUT_URL"),
    inquiryUrl: readEnv("JAZZCASH_INQUIRY_URL"),
  };
}

function isConfigured() {
  const creds = credentials();
  return (
    configured(creds.merchantId) &&
    configured(creds.password) &&
    configured(creds.integritySalt)
  );
}

function checkoutUrl() {
  const creds = credentials();
  if (configured(creds.checkoutUrl)) {
    return creds.checkoutUrl;
  }
  if (isProductionPayments()) {
    return "";
  }
  return "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform";
}

function missingVariables() {
  const missing = [];
  if (!configured(readEnv("JAZZCASH_MERCHANT_ID"))) missing.push("JAZZCASH_MERCHANT_ID");
  if (!configured(readEnv("JAZZCASH_PASSWORD"))) missing.push("JAZZCASH_PASSWORD");
  if (!configured(readEnv("JAZZCASH_INTEGRITY_SALT"))) missing.push("JAZZCASH_INTEGRITY_SALT");
  if (isProductionPayments() && !configured(readEnv("JAZZCASH_CHECKOUT_URL"))) {
    missing.push("JAZZCASH_CHECKOUT_URL");
  }
  return missing;
}

function assertReady() {
  const missing = missingVariables();
  if (missing.length > 0 || !checkoutUrl()) {
    throw new HttpError(
      501,
      "JazzCash merchant credentials are not configured. Use test checkout for local development.",
      "PROVIDER_NOT_CONNECTED",
    );
  }
}

function formatStamp(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  );
}

function mapResponseCode(code) {
  const value = String(code || "").trim();
  if (value === "000") {
    return "successful";
  }
  if (value === "124") {
    return "pending";
  }
  if (value === "157" || value === "IPN001") {
    return "cancelled";
  }
  return "failed";
}

function buildHostedFields(order, options = {}) {
  assertReady();
  const creds = credentials();
  const now = new Date();
  const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const txnRef = order.provider_reference || `T${formatStamp(now)}${order.id.replace(/-/g, "").slice(0, 6)}`;
  const returnPath = options.returnPath || "/api/billing/callbacks/jazzcash";
  const fields = {
    pp_Version: "1.1",
    pp_TxnType: options.txnType || readEnv("JAZZCASH_TXN_TYPE"),
    pp_Language: "EN",
    pp_MerchantID: creds.merchantId,
    pp_SubMerchantID: readEnv("JAZZCASH_SUB_MERCHANT_ID"),
    pp_Password: creds.password,
    pp_TxnRefNo: txnRef,
    pp_Amount: toPaisa(order.amount),
    pp_TxnCurrency: order.currency || "PKR",
    pp_TxnDateTime: formatStamp(now),
    pp_BillReference: order.id,
    pp_Description: "Aro Pro",
    pp_TxnExpiryDateTime: formatStamp(expiry),
    pp_ReturnURL: `${apiOrigin()}${returnPath}`,
    ppmpf_1: order.id,
  };
  fields.pp_SecureHash = jazzcashSecureHash(fields, creds.integritySalt);
  return {
    action: checkoutUrl(),
    fields,
    providerReference: txnRef,
    checkout: {
      type: "hosted_launch",
      live: isProductionPayments(),
      env: paymentEnv(),
      launchPath: `/api/billing/orders/${order.id}/launch`,
      returnTo: `${clientOrigin()}/upgrade/result?order=${order.id}`,
    },
  };
}

function parseCallback(payload) {
  const body = payload && typeof payload === "object" ? payload : {};
  const creds = credentials();
  if (!jazzcashHashValid(body, creds.integritySalt)) {
    throw new HttpError(400, "JazzCash signature is invalid.", "INVALID_SIGNATURE");
  }
  if (String(body.pp_MerchantID || "") !== creds.merchantId) {
    throw new HttpError(400, "JazzCash merchant does not match.", "MERCHANT_MISMATCH");
  }
  const status = mapResponseCode(body.pp_ResponseCode);
  return {
    status,
    providerReference: body.pp_TxnRefNo,
    providerTransactionId: body.pp_RetrievalReferenceNo || body.pp_RetreivalReferenceNo || null,
    amount: fromPaisa(body.pp_Amount),
    currency: body.pp_TxnCurrency || "PKR",
    paymentId: body.ppmpf_1 || body.pp_BillReference || null,
    failureReason:
      status === "successful" ? null : body.pp_ResponseMessage || "JazzCash payment was not successful.",
    rawCode: body.pp_ResponseCode,
  };
}

async function inquire(order) {
  const creds = credentials();
  if (!configured(creds.inquiryUrl)) {
    return null;
  }
  const fields = {
    pp_Version: "1.1",
    pp_TxnType: "Inquiry",
    pp_MerchantID: creds.merchantId,
    pp_Password: creds.password,
    pp_TxnRefNo: order.provider_reference,
  };
  fields.pp_SecureHash = jazzcashSecureHash(fields, creds.integritySalt);
  const response = await fetch(creds.inquiryUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
  const data = await response.json().catch(() => ({}));
  if (!jazzcashHashValid({ ...data, pp_SecureHash: data.pp_SecureHash }, creds.integritySalt) && data.pp_SecureHash) {
    throw new HttpError(400, "JazzCash inquiry signature is invalid.", "INVALID_SIGNATURE");
  }
  return parseCallback(data);
}

module.exports = {
  isConfigured,
  missingVariables,
  assertReady,
  checkoutUrl,
  buildHostedFields,
  parseCallback,
  inquire,
  mapResponseCode,
};
