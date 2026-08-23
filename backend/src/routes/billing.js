const { Router } = require("express");
const multer = require("multer");
const attachPlan = require("../middleware/attachPlan");
const requireAuth = require("../middleware/requireAuth");
const { HttpError } = require("../utils/httpError");
const { isKnownProvider } = require("../config/billing");
const { hostedFormHtml } = require("../billing/shared");
const { serviceSupabase } = require("../config/supabase");
const {
  catalog,
  createOrder,
  getOrder,
  listUserPayments,
  verifyOrder,
  submitBankReference,
  launchCheckout,
} = require("../services/billingService");
const {
  uploadPaymentProof,
  getProofDownloadUrl,
  deletePaymentProof,
} = require("../services/proofService");

const PAYMENT_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readPaymentId(id) {
  if (typeof id !== "string" || !PAYMENT_ID.test(id)) {
    throw new HttpError(400, "Invalid payment id.");
  }
  return id;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024,
    files: 1,
    fields: 5,
  },
});

const billingRouter = Router();

billingRouter.get("/catalog", (_req, res) => {
  const data = catalog();
  res.json({
    success: true,
    ...data,
  });
});

billingRouter.post("/orders", attachPlan, requireAuth, async (req, res, next) => {
  try {
    const provider =
      typeof req.body?.provider === "string" ? req.body.provider.trim() : "";
    if (!isKnownProvider(provider)) {
      throw new HttpError(400, "Choose a payment method.", "UNKNOWN_PROVIDER");
    }
    const payment = await createOrder(req.userId, provider);
    res.status(201).json({
      success: true,
      paymentEnv: catalog().paymentEnv,
      livePayments: catalog().livePayments,
      payment,
    });
  } catch (error) {
    next(error);
  }
});

billingRouter.get("/orders", attachPlan, requireAuth, async (req, res, next) => {
  try {
    const payments = await listUserPayments(req.userId);
    res.json({
      success: true,
      payments,
    });
  } catch (error) {
    next(error);
  }
});

billingRouter.get("/orders/:id", attachPlan, requireAuth, async (req, res, next) => {
  try {
    const payment = await getOrder(req.userId, readPaymentId(req.params.id));
    res.json({
      success: true,
      payment,
    });
  } catch (error) {
    next(error);
  }
});

billingRouter.post(
  "/orders/:id/verify",
  attachPlan,
  requireAuth,
  async (req, res, next) => {
    try {
      const payment = await verifyOrder(req.userId, readPaymentId(req.params.id), {
        outcome: req.body?.outcome,
      });
      res.json({
        success: true,
        payment,
      });
    } catch (error) {
      next(error);
    }
  },
);

billingRouter.post(
  "/orders/:id/bank-reference",
  attachPlan,
  requireAuth,
  async (req, res, next) => {
    try {
      const payment = await submitBankReference(
        req.userId,
        readPaymentId(req.params.id),
        req.body?.reference,
      );
      res.json({
        success: true,
        payment,
      });
    } catch (error) {
      next(error);
    }
  },
);

billingRouter.post(
  "/orders/:id/proof",
  attachPlan,
  requireAuth,
  upload.single("proof"),
  async (req, res, next) => {
    try {
      if (!req.file?.buffer) {
        throw new HttpError(400, "Attach a payment screenshot.", "PROOF_REQUIRED");
      }
      await uploadPaymentProof(
        req.userId,
        readPaymentId(req.params.id),
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname,
      );
      const payment = await getOrder(req.userId, readPaymentId(req.params.id));
      res.json({
        success: true,
        payment,
      });
    } catch (error) {
      next(error);
    }
  },
);

billingRouter.get(
  "/orders/:id/proof",
  attachPlan,
  requireAuth,
  async (req, res, next) => {
    try {
      const proof = await getProofDownloadUrl(req.userId, readPaymentId(req.params.id));
      res.json({
        success: true,
        ...proof,
      });
    } catch (error) {
      next(error);
    }
  },
);

billingRouter.delete(
  "/orders/:id/proof",
  attachPlan,
  requireAuth,
  async (req, res, next) => {
    try {
      const result = await deletePaymentProof(req.userId, readPaymentId(req.params.id));
      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },
);

billingRouter.post(
  "/orders/:id/launch",
  attachPlan,
  requireAuth,
  async (req, res, next) => {
    try {
      const launch = await launchCheckout(req.userId, readPaymentId(req.params.id));
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(hostedFormHtml(launch.action, launch.fields));
    } catch (error) {
      next(error);
    }
  },
);

module.exports = billingRouter;
