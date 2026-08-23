const crypto = require("crypto");
const { HttpError } = require("../utils/httpError");

function timingSafeEqualHex(left, right) {
  const a = Buffer.from(String(left || "").toLowerCase(), "utf8");
  const b = Buffer.from(String(right || "").toLowerCase(), "utf8");
  if (a.length === 0 || a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

function toMajorAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return null;
  }
  return Math.round(amount * 100) / 100;
}

function toPaisa(amount) {
  return String(Math.round(Number(amount) * 100));
}

function fromPaisa(paisa) {
  return Math.round(Number(paisa)) / 100;
}

function amountsEqual(left, right) {
  const a = toMajorAmount(left);
  const b = toMajorAmount(right);
  if (a == null || b == null) {
    return false;
  }
  return a === b;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function hostedFormHtml(action, fields) {
  const inputs = Object.entries(fields)
    .map(
      ([name, value]) =>
        `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(value ?? "")}" />`,
    )
    .join("");
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Redirecting to payment provider</title>
  </head>
  <body>
    <p>Redirecting to the payment provider…</p>
    <form id="aro-pay" method="POST" action="${escapeHtml(action)}">
      ${inputs}
    </form>
    <script>document.getElementById("aro-pay").submit();</script>
  </body>
</html>`;
}

function assertMatch(order, result) {
  if (result.providerReference && order.provider_reference) {
    if (String(result.providerReference) !== String(order.provider_reference)) {
      throw new HttpError(
        400,
        "Transaction reference does not match this order.",
        "TXN_MISMATCH",
      );
    }
  }
  if (result.amount != null && !amountsEqual(result.amount, order.amount)) {
    throw new HttpError(
      400,
      "Payment amount does not match this order.",
      "AMOUNT_MISMATCH",
    );
  }
  if (result.currency && String(result.currency).toUpperCase() !== String(order.currency).toUpperCase()) {
    throw new HttpError(
      400,
      "Payment currency does not match this order.",
      "CURRENCY_MISMATCH",
    );
  }
}

module.exports = {
  timingSafeEqualHex,
  toMajorAmount,
  toPaisa,
  fromPaisa,
  amountsEqual,
  escapeHtml,
  hostedFormHtml,
  assertMatch,
};
