const crypto = require("crypto");
const { Router } = require("express");
const { HttpError } = require("../utils/httpError");
const { configured, readEnv } = require("../config/payments");
const {
  resolveBankPayment,
  adminListPayments,
  adminGetPaymentDetails,
  adminApprovePayment,
  adminRejectPayment,
} = require("../services/billingService");
const { adminGetProofDownloadUrl } = require("../services/proofService");

const PAYMENT_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function secretsEqual(left, right) {
  const a = Buffer.from(String(left || ""), "utf8");
  const b = Buffer.from(String(right || ""), "utf8");
  if (a.length === 0 || a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

function requireAdminSecret(req, _res, next) {
  const expected = readEnv("BILLING_ADMIN_SECRET");
  if (!configured(expected)) {
    next(new HttpError(503, "Bank verification is not configured.", "ADMIN_NOT_CONFIGURED"));
    return;
  }
  const header = req.headers.authorization || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const provided = req.headers["x-billing-admin-secret"] || bearer;
  if (!provided || !secretsEqual(provided, expected)) {
    next(new HttpError(401, "Admin verification secret is invalid.", "ADMIN_UNAUTHORIZED"));
    return;
  }
  next();
}

function readPaymentId(id) {
  if (typeof id !== "string" || !PAYMENT_ID.test(id)) {
    throw new HttpError(400, "Invalid payment id.");
  }
  return id;
}

const adminRouter = Router();

adminRouter.get("/payments", requireAdminSecret, async (req, res, next) => {
  try {
    const params = {
      status: typeof req.query.status === "string" ? req.query.status : "",
      provider: typeof req.query.provider === "string" ? req.query.provider : "",
      limit: typeof req.query.limit === "string" ? req.query.limit : 50,
    };
    const result = await adminListPayments(params);
    res.json({
      success: true,
      total: result.total,
      pendingCount: result.pendingCount,
      payments: result.payments,
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/payments/:id", requireAdminSecret, async (req, res, next) => {
  try {
    const result = await adminGetPaymentDetails(readPaymentId(req.params.id));
    res.json({
      success: true,
      payment: result.payment,
      user: result.user,
      hasProof: result.hasProof,
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/payments/:id/proof", requireAdminSecret, async (req, res, next) => {
  try {
    const result = await adminGetProofDownloadUrl(readPaymentId(req.params.id));
    res.json({
      success: true,
      url: result.url,
      expiresIn: result.expiresIn,
      mimeType: result.mimeType,
      size: result.size,
      uploadedAt: result.uploadedAt,
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.post("/payments/:id/approve", requireAdminSecret, async (req, res, next) => {
  try {
    const payment = await adminApprovePayment(readPaymentId(req.params.id));
    res.json({
      success: true,
      payment,
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.post("/payments/:id/reject", requireAdminSecret, async (req, res, next) => {
  try {
    const reason = typeof req.body?.reason === "string" ? req.body.reason : "";
    const payment = await adminRejectPayment(readPaymentId(req.params.id), reason);
    res.json({
      success: true,
      payment,
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.post("/payments/:id/resolve", requireAdminSecret, async (req, res, next) => {
  try {
    readPaymentId(req.params.id);
    const outcome =
      typeof req.body?.outcome === "string" ? req.body.outcome.trim() : "";
    if (outcome !== "successful" && outcome !== "failed") {
      throw new HttpError(400, "Outcome must be successful or failed.");
    }
    const payment = await resolveBankPayment(
      req.params.id,
      outcome,
      typeof req.body?.reason === "string" ? req.body.reason : "",
    );
    res.json({
      success: true,
      payment,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = adminRouter;
