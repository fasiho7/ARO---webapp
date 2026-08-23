const { HttpError } = require("../../utils/httpError");
const {
  configured,
  isProductionPayments,
  paymentEnv,
  readEnv,
  apiOrigin,
  clientOrigin,
} = require("../../config/payments");
const { easypaisaMerchantHash } = require("../easypaisaHash");
const { amountsEqual } = require("../shared");

function credentials() {
  return {
    storeId: readEnv("EASYPAISA_STORE_ID"),
    hashKey: readEnv("EASYPAISA_HASH_KEY"),
    accountNum: readEnv("EASYPAISA_ACCOUNT_NUM"),
    username: readEnv("EASYPAISA_USERNAME"),
    password: readEnv("EASYPAISA_PASSWORD"),
    paymentMethod: readEnv("EASYPAISA_PAYMENT_METHOD"),
  };
}

function indexUrl() {
  const override = readEnv("EASYPAISA_INDEX_URL");
  if (configured(override)) {
    return override;
  }
  return isProductionPayments()
    ? "https://easypay.easypaisa.com.pk/easypay/Index.jsf"
    : "https://easypaystg.easypaisa.com.pk/easypay/Index.jsf";
}

function confirmUrl() {
  const override = readEnv("EASYPAISA_CONFIRM_URL");
  if (configured(override)) {
    return override;
  }
  return isProductionPayments()
    ? "https://easypay.easypaisa.com.pk/easypay/Confirm.jsf"
    : "https://easypaystg.easypaisa.com.pk/easypay/Confirm.jsf";
}

function inquireUrl() {
  const override = readEnv("EASYPAISA_INQUIRE_URL");
  if (configured(override)) {
    return override;
  }
  return isProductionPayments()
    ? "https://easypay.easypaisa.com.pk/easypay-service/rest/v4/inquire-transaction"
    : "https://easypaystg.easypaisa.com.pk/easypay-service/rest/v4/inquire-transaction";
}

function isConfigured() {
  const creds = credentials();
  return configured(creds.storeId) && configured(creds.hashKey);
}

function canInquire() {
  const creds = credentials();
  return (
    isConfigured() &&
    configured(creds.accountNum) &&
    configured(creds.username) &&
    configured(creds.password)
  );
}

function missingVariables() {
  const missing = [];
  if (!configured(readEnv("EASYPAISA_STORE_ID"))) missing.push("EASYPAISA_STORE_ID");
  if (!configured(readEnv("EASYPAISA_HASH_KEY"))) missing.push("EASYPAISA_HASH_KEY");
  if (!configured(readEnv("EASYPAISA_ACCOUNT_NUM"))) missing.push("EASYPAISA_ACCOUNT_NUM");
  if (!configured(readEnv("EASYPAISA_USERNAME"))) missing.push("EASYPAISA_USERNAME");
  if (!configured(readEnv("EASYPAISA_PASSWORD"))) missing.push("EASYPAISA_PASSWORD");
  return missing;
}

function assertReady() {
  if (!isConfigured()) {
    throw new HttpError(
      501,
      "Easypaisa merchant credentials are not configured. Use test checkout for local development.",
      "PROVIDER_NOT_CONNECTED",
    );
  }
}

function formatAmount(amount) {
  return Number(amount).toFixed(1);
}

function formatExpiry(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  );
}

function mapInquireStatus(transactionStatus) {
  const value = String(transactionStatus || "").toUpperCase();
  if (value === "PAID") {
    return "successful";
  }
  if (value === "PENDING") {
    return "pending";
  }
  if (value === "EXPIRED") {
    return "failed";
  }
  if (value === "FAILED" || value === "BLOCKED" || value === "REVERSED") {
    return "failed";
  }
  return "pending";
}

function buildHostedFields(order, paymentMethod, returnPath) {
  assertReady();
  const creds = credentials();
  const expiry = new Date(Date.now() + 60 * 60 * 1000);
  const orderRef = order.provider_reference || order.id.replace(/-/g, "").slice(0, 20);
  const fields = {
    amount: formatAmount(order.amount),
    storeId: creds.storeId,
    postBackURL: `${apiOrigin()}${returnPath || "/api/billing/callbacks/easypaisa"}`,
    orderRefNum: orderRef,
    autoRedirect: "1",
    expiryDate: formatExpiry(expiry),
  };
  const method = paymentMethod || creds.paymentMethod;
  if (method) {
    fields.paymentMethod = method;
  }
  fields.merchantHashedReq = easypaisaMerchantHash(fields, creds.hashKey);
  return {
    action: indexUrl(),
    fields,
    providerReference: orderRef,
    checkout: {
      type: "hosted_launch",
      live: isProductionPayments(),
      env: paymentEnv(),
      launchPath: `/api/billing/orders/${order.id}/launch`,
      returnTo: `${clientOrigin()}/upgrade/result?order=${order.id}`,
    },
  };
}

async function inquire(order) {
  if (!canInquire()) {
    return null;
  }
  const creds = credentials();
  const basic = Buffer.from(`${creds.username}:${creds.password}`).toString("base64");
  const response = await fetch(inquireUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Credentials: basic,
    },
    body: JSON.stringify({
      orderId: order.provider_reference,
      storeId: creds.storeId,
      accountNum: creds.accountNum,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (String(data.responseCode || "") !== "0000" && !data.transactionStatus) {
    throw new HttpError(
      502,
      data.responseDesc || "Easypaisa could not inquire this transaction.",
      "PROVIDER_INQUIRE_FAILED",
    );
  }
  const status = mapInquireStatus(data.transactionStatus);
  if (
    data.transactionAmount != null &&
    status === "successful" &&
    !amountsEqual(data.transactionAmount, order.amount)
  ) {
    throw new HttpError(400, "Payment amount does not match this order.", "AMOUNT_MISMATCH");
  }
  if (data.storeId != null && String(data.storeId) !== String(creds.storeId)) {
    throw new HttpError(400, "Easypaisa store does not match.", "MERCHANT_MISMATCH");
  }
  return {
    status,
    providerReference: data.orderId || order.provider_reference,
    providerTransactionId: data.paymentToken || null,
    amount: data.transactionAmount != null ? Number(data.transactionAmount) : Number(order.amount),
    currency: order.currency,
    failureReason:
      status === "successful"
        ? null
        : data.responseDesc || data.transactionStatus || "Easypaisa payment is not paid.",
  };
}

function parseBrowserResult(payload) {
  const body = payload && typeof payload === "object" ? payload : {};
  const statusValue = String(body.status || "").toLowerCase();
  const desc = String(body.desc || "");
  if (statusValue === "success" && desc === "0000") {
    return {
      claimedSuccess: true,
      providerReference: body.orderRefNum || body.orderRefNumber,
    };
  }
  if (statusValue === "failure") {
    return {
      claimedSuccess: false,
      status: "failed",
      providerReference: body.orderRefNum || body.orderRefNumber,
      failureReason: desc || "Easypaisa payment failed.",
    };
  }
  return {
    claimedSuccess: false,
    status: "pending",
    providerReference: body.orderRefNum || body.orderRefNumber,
  };
}

module.exports = {
  isConfigured,
  canInquire,
  missingVariables,
  assertReady,
  indexUrl,
  confirmUrl,
  inquireUrl,
  buildHostedFields,
  inquire,
  parseBrowserResult,
  credentials,
};
