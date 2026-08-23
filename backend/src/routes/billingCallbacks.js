const { Router } = require("express");
const { HttpError } = require("../utils/httpError");
const { clientOrigin, apiOrigin } = require("../config/payments");
const { hostedFormHtml } = require("../billing/shared");
const easypaisaCore = require("../billing/providers/easypaisaCore");
const {
  handleProviderCallback,
  serializePayment,
} = require("../services/billingService");

function mergedPayload(req) {
  return {
    ...(req.query || {}),
    ...(req.body || {}),
  };
}

function resultRedirect(payment) {
  return `${clientOrigin()}/upgrade/result?order=${payment.id}`;
}

async function handle(providerId, req, res, next) {
  try {
    const payload = mergedPayload(req);
    if (
      (providerId === "easypaisa" || providerId === "card") &&
      (payload.auth_token || payload.authToken) &&
      !payload.status
    ) {
      const html = hostedFormHtml(easypaisaCore.confirmUrl(), {
        auth_token: payload.auth_token || payload.authToken,
        postBackURL: `${apiOrigin()}/api/billing/callbacks/easypaisa`,
      });
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(html);
      return;
    }
    const row = await handleProviderCallback(providerId, payload);
    const payment = serializePayment(row);
    res.redirect(302, resultRedirect(payment));
  } catch (error) {
    if (error instanceof HttpError && error.statusCode < 500) {
      res.redirect(
        302,
        `${clientOrigin()}/upgrade/result?error=${encodeURIComponent(error.code || "PAYMENT_ERROR")}`,
      );
      return;
    }
    next(error);
  }
}

const callbacksRouter = Router();

callbacksRouter.get("/easypaisa", (req, res, next) => handle("easypaisa", req, res, next));
callbacksRouter.post("/easypaisa", (req, res, next) => handle("easypaisa", req, res, next));
callbacksRouter.get("/jazzcash", (req, res, next) => handle("jazzcash", req, res, next));
callbacksRouter.post("/jazzcash", (req, res, next) => handle("jazzcash", req, res, next));
callbacksRouter.get("/card", (req, res, next) => handle("card", req, res, next));
callbacksRouter.post("/card", (req, res, next) => handle("card", req, res, next));

module.exports = callbacksRouter;
