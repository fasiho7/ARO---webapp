const { serviceSupabase } = require("../config/supabase");
const {
  PRODUCT_ID,
  isTerminalStatus,
  productCatalog,
} = require("../config/billing");
const { paymentEnv } = require("../config/payments");
const { getProvider, listMethods } = require("../billing/providers");
const { assertMatch } = require("../billing/shared");
const { HttpError } = require("../utils/httpError");

function requireAdmin() {
  if (!serviceSupabase) {
    throw new HttpError(
      503,
      "Billing is not configured. Set SUPABASE_SERVICE_ROLE_KEY in backend/.env.",
      "BILLING_NOT_CONFIGURED",
    );
  }
  return serviceSupabase;
}

function publicCheckout(checkout) {
  if (!checkout || typeof checkout !== "object") {
    return null;
  }
  return {
    type: checkout.type || null,
    live: Boolean(checkout.live),
    env: checkout.env || null,
    message: checkout.message || null,
    launchPath: checkout.launchPath || null,
    returnTo: checkout.returnTo || null,
    instructions: checkout.instructions || null,
  };
}

function serializePayment(row) {
  return {
    id: row.id,
    userId: row.user_id,
    product: row.product,
    amount: Number(row.amount),
    currency: row.currency,
    provider: row.provider,
    status: row.status,
    providerReference: row.provider_reference,
    providerTransactionId: row.provider_transaction_id || null,
    failureReason: row.failure_reason,
    checkout: publicCheckout(row.metadata?.checkout),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    paidAt: row.paid_at,
    completedAt: row.completed_at || row.paid_at,
  };
}

function catalog() {
  const methods = listMethods();
  return {
    product: productCatalog(),
    methods,
    livePayments: methods.some((method) => method.available && method.id !== "mock"),
    paymentEnv: paymentEnv(),
  };
}

async function readProfilePlan(userId) {
  const admin = requireAdmin();
  const { data, error } = await admin
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    throw new HttpError(503, "Could not load your plan.", "PLAN_LOOKUP_FAILED");
  }
  return data?.plan === "pro" ? "pro" : "free";
}

async function grantProPlan(userId) {
  const admin = requireAdmin();
  const { data, error } = await admin
    .from("profiles")
    .update({ plan: "pro" })
    .eq("id", userId)
    .select("id")
    .maybeSingle();
  if (error || !data) {
    throw new HttpError(
      503,
      "Payment was recorded, but Pro could not be applied. Try opening this order again.",
      "PLAN_UPGRADE_FAILED",
    );
  }
}

async function loadOwnedPayment(userId, paymentId) {
  const admin = requireAdmin();
  const { data, error } = await admin
    .from("payments")
    .select("*")
    .eq("id", paymentId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    throw new HttpError(503, "Could not load this payment.", "PAYMENT_LOOKUP_FAILED");
  }
  if (!data) {
    throw new HttpError(404, "Payment not found.", "PAYMENT_NOT_FOUND");
  }
  return data;
}

async function loadPaymentById(paymentId) {
  const admin = requireAdmin();
  const { data, error } = await admin
    .from("payments")
    .select("*")
    .eq("id", paymentId)
    .maybeSingle();
  if (error) {
    throw new HttpError(503, "Could not load this payment.", "PAYMENT_LOOKUP_FAILED");
  }
  if (!data) {
    throw new HttpError(404, "Payment not found.", "PAYMENT_NOT_FOUND");
  }
  return data;
}

async function loadPaymentByReference(provider, providerReference) {
  const admin = requireAdmin();
  const { data, error } = await admin
    .from("payments")
    .select("*")
    .eq("provider", provider)
    .eq("provider_reference", providerReference)
    .maybeSingle();
  if (error) {
    throw new HttpError(503, "Could not load this payment.", "PAYMENT_LOOKUP_FAILED");
  }
  return data;
}

async function findPendingOrder(userId, providerId) {
  const admin = requireAdmin();
  const { data, error } = await admin
    .from("payments")
    .select("*")
    .eq("user_id", userId)
    .eq("product", PRODUCT_ID)
    .eq("provider", providerId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) {
    throw new HttpError(503, "Could not start checkout.", "PAYMENT_CREATE_FAILED");
  }
  return Array.isArray(data) ? data[0] || null : data;
}

async function applyVerifiedResult(row, result) {
  assertMatch(row, result);
  if (result.status === "pending" || !result.status) {
    return row;
  }

  if (row.status === "successful") {
    await grantProPlan(row.user_id);
    return row;
  }
  if (isTerminalStatus(row.status)) {
    return row;
  }

  const admin = requireAdmin();
  const now = new Date().toISOString();
  const successful = result.status === "successful";
  const patch = {
    status: result.status,
    provider_reference: result.providerReference || row.provider_reference,
    provider_transaction_id:
      result.providerTransactionId || row.provider_transaction_id,
    failure_reason: result.failureReason || null,
    paid_at: successful ? now : row.paid_at,
    completed_at: successful ? now : row.completed_at,
  };

  const { data, error } = await admin
    .from("payments")
    .update(patch)
    .eq("id", row.id)
    .eq("status", "pending")
    .select("*")
    .maybeSingle();

  if (error) {
    throw new HttpError(503, "Could not update this payment.", "PAYMENT_UPDATE_FAILED");
  }

  const next = data || (await loadPaymentById(row.id));
  if (next.status === "successful") {
    await grantProPlan(row.user_id);
  }
  return next;
}

async function attachProviderCheckout(row) {
  const provider = getProvider(row.provider);
  const created = await provider.createPayment(row);
  const admin = requireAdmin();
  const metadata = {
    ...(row.metadata && typeof row.metadata === "object" ? row.metadata : {}),
    checkout: publicCheckout(created.checkout),
  };
  const { data, error } = await admin
    .from("payments")
    .update({
      provider_reference: created.providerReference || row.provider_reference,
      metadata,
    })
    .eq("id", row.id)
    .select("*")
    .single();
  if (error || !data) {
    throw new HttpError(503, "Could not start checkout.", "PAYMENT_CREATE_FAILED");
  }
  return { row: data, created };
}

async function createOrder(userId, providerId) {
  const provider = getProvider(providerId);
  if (!provider.isAvailable()) {
    throw new HttpError(
      501,
      `${provider.label} is not connected yet. Add merchant credentials or use test checkout.`,
      "PROVIDER_NOT_CONNECTED",
    );
  }

  const plan = await readProfilePlan(userId);
  if (plan === "pro") {
    throw new HttpError(409, "You already have Pro.", "ALREADY_PRO");
  }

  const existing = await findPendingOrder(userId, providerId);
  if (existing) {
    const attached = await attachProviderCheckout(existing);
    return serializePayment(attached.row);
  }

  const admin = requireAdmin();
  const product = productCatalog();

  const { error: cancelError } = await admin
    .from("payments")
    .update({
      status: "cancelled",
      failure_reason: "Superseded by a new checkout.",
    })
    .eq("user_id", userId)
    .eq("product", PRODUCT_ID)
    .eq("status", "pending")
    .neq("provider", providerId);
  if (cancelError) {
    throw new HttpError(503, "Could not start checkout.", "PAYMENT_CREATE_FAILED");
  }

  const { data: inserted, error: insertError } = await admin
    .from("payments")
    .insert({
      user_id: userId,
      product: product.id,
      amount: product.amount,
      currency: product.currency,
      provider: provider.id,
      status: "pending",
    })
    .select("*")
    .single();

  if (insertError || !inserted) {
    if (insertError?.code === "23505") {
      const raced = await findPendingOrder(userId, providerId);
      if (raced) {
        const attached = await attachProviderCheckout(raced);
        return serializePayment(attached.row);
      }
    }
    throw new HttpError(503, "Could not create this payment.", "PAYMENT_CREATE_FAILED");
  }

  try {
    const attached = await attachProviderCheckout(inserted);
    return serializePayment(attached.row);
  } catch (error) {
    await admin
      .from("payments")
      .update({
        status: "failed",
        failure_reason: error.message || "Provider could not start checkout.",
      })
      .eq("id", inserted.id);
    throw error;
  }
}

async function getOrder(userId, paymentId) {
  const row = await loadOwnedPayment(userId, paymentId);
  if (row.status === "successful") {
    await grantProPlan(userId);
  }
  return serializePayment(row);
}

async function listUserPayments(userId) {
  const admin = requireAdmin();
  const { data, error } = await admin
    .from("payments")
    .select(
      "id,user_id,product,amount,currency,provider,status,provider_reference,provider_transaction_id,failure_reason,metadata,paid_at,created_at,updated_at,completed_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    throw new HttpError(503, "Could not load payments.", "PAYMENTS_LOOKUP_FAILED");
  }
  return (data || []).map((row) => serializePayment(row));
}

async function verifyOrder(userId, paymentId, payload) {
  const row = await loadOwnedPayment(userId, paymentId);
  if (row.status === "successful") {
    await grantProPlan(userId);
    return serializePayment(row);
  }
  if (isTerminalStatus(row.status)) {
    return serializePayment(row);
  }

  const provider = getProvider(row.provider);
  const body = payload && typeof payload === "object" ? { ...payload } : {};
  if (row.provider !== "mock") {
    delete body.outcome;
  }
  const result = await provider.verifyPayment(row, body);
  if (!result?.status) {
    throw new HttpError(502, "Payment provider did not return a status.");
  }
  const next = await applyVerifiedResult(row, result);
  return serializePayment(next);
}

async function submitBankReference(userId, paymentId, reference) {
  const row = await loadOwnedPayment(userId, paymentId);
  if (row.provider !== "bank" && row.provider !== "easypaisa") {
    throw new HttpError(400, "This order does not accept a manual reference.");
  }
  if (row.status !== "pending") {
    throw new HttpError(409, "This payment is no longer waiting for a transfer.");
  }
  const value = typeof reference === "string" ? reference.trim() : "";
  if (value.length < 4 || value.length > 80) {
    throw new HttpError(400, "Enter the bank transfer reference.");
  }
  const admin = requireAdmin();
  const { data, error } = await admin
    .from("payments")
    .update({
      provider_transaction_id: value,
      metadata: {
        ...(row.metadata && typeof row.metadata === "object" ? row.metadata : {}),
        bankReferenceSubmittedAt: new Date().toISOString(),
      },
    })
    .eq("id", row.id)
    .eq("status", "pending")
    .select("*")
    .single();
  if (error || !data) {
    throw new HttpError(503, "Could not save the transfer reference.");
  }
  return serializePayment(data);
}

async function resolveBankPayment(paymentId, outcome, reason) {
  const row = await loadPaymentById(paymentId);
  if (row.provider !== "bank") {
    throw new HttpError(400, "This order is not a bank transfer.");
  }
  const provider = getProvider("bank");
  const result = await provider.verifyPayment(row, {
    outcome,
    reason,
    source: "admin",
  });
  const next = await applyVerifiedResult(row, result);
  return serializePayment(next);
}

async function launchCheckout(userId, paymentId) {
  const row = await loadOwnedPayment(userId, paymentId);
  if (row.status !== "pending") {
    throw new HttpError(409, "This payment is no longer waiting for checkout.");
  }
  const provider = getProvider(row.provider);
  const created = await provider.createPayment(row);
  if (!created.launch?.action || !created.launch?.fields) {
    throw new HttpError(400, "This payment method does not use hosted checkout.");
  }
  return created.launch;
}

async function handleProviderCallback(providerId, payload) {
  const provider = getProvider(providerId);
  const parsed = await provider.handleCallback(payload);
  const paymentId = parsed.paymentId;
  const reference = parsed.providerReference;
  let row = null;
  if (paymentId) {
    row = await loadPaymentById(paymentId);
  } else if (reference) {
    row = await loadPaymentByReference(providerId, reference);
  }
  if (!row) {
    throw new HttpError(404, "Payment not found.", "PAYMENT_NOT_FOUND");
  }
  if (row.provider !== providerId) {
    throw new HttpError(400, "Payment provider does not match.", "PROVIDER_MISMATCH");
  }

  if (providerId === "easypaisa" && parsed.claimedSuccess) {
    const inquired = await provider.verifyPayment(row, {});
    const next = await applyVerifiedResult(row, inquired);
    return next;
  }

  if (parsed.status && parsed.status !== "pending") {
    const next = await applyVerifiedResult(row, {
      ...parsed,
      amount: parsed.amount ?? Number(row.amount),
      currency: parsed.currency || row.currency,
    });
    return next;
  }

  const inquired = await provider.verifyPayment(row, payload);
  return applyVerifiedResult(row, inquired);
}

async function adminListPayments(params = {}) {
  const admin = requireAdmin();
  const { isKnownStatus, isKnownProvider } = require("../config/billing");

  const status = typeof params.status === "string" && params.status.trim() ? params.status.trim() : null;
  const provider = typeof params.provider === "string" && params.provider.trim() ? params.provider.trim() : null;
  const limit = Number.isFinite(Number(params.limit)) && Number(params.limit) > 0
    ? Math.min(Number(params.limit), 500)
    : 50;

  if (status && !isKnownStatus(status)) {
    throw new HttpError(400, "Invalid payment status.", "INVALID_STATUS");
  }
  if (provider && !isKnownProvider(provider)) {
    throw new HttpError(400, "Invalid payment provider.", "INVALID_PROVIDER");
  }

  const query = admin.from("payments").select("*", { count: "exact" });

  if (status) {
    query.eq("status", status);
  }
  if (provider) {
    query.eq("provider", provider);
  }

  query.order("created_at", { ascending: false }).limit(limit);

  const { data, error, count } = await query;

  if (error) {
    throw new HttpError(503, "Could not list payments.", "PAYMENT_LIST_FAILED");
  }

  let pendingCount = 0;
  if (!status && !provider) {
    const { count: pending, error: pendingError } = await admin
      .from("payments")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");
    if (!pendingError) {
      pendingCount = pending || 0;
    }
  } else if (status === "pending") {
    pendingCount = count || 0;
  }

  return {
    payments: Array.isArray(data) ? data.map(serializePayment) : [],
    total: count || 0,
    pendingCount,
  };
}

async function adminGetPaymentDetails(paymentId) {
  const row = await loadPaymentById(paymentId);
  const admin = requireAdmin();

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id, email, full_name, plan, created_at")
    .eq("id", row.user_id)
    .maybeSingle();

  if (profileError) {
    throw new HttpError(503, "Could not load user profile.", "PROFILE_LOOKUP_FAILED");
  }

  const user = profile
    ? {
        id: profile.id,
        email: profile.email || null,
        fullName: profile.full_name || null,
        plan: profile.plan || "free",
        createdAt: profile.created_at,
      }
    : {
        id: row.user_id,
        email: null,
        fullName: null,
        plan: "free",
        createdAt: null,
      };

  const proofPath = row.metadata?.proofPath;
  const hasProof = Boolean(proofPath && typeof proofPath === "string" && proofPath.trim());

  return {
    payment: serializePayment(row),
    user,
    hasProof,
  };
}

async function adminApprovePayment(paymentId) {
  const row = await loadPaymentById(paymentId);

  if (row.status === "successful") {
    await grantProPlan(row.user_id);
    return serializePayment(row);
  }
  if (isTerminalStatus(row.status)) {
    return serializePayment(row);
  }

  if (row.provider !== "bank" && row.provider !== "easypaisa") {
    throw new HttpError(400, "Approval is only available for bank or Easypaisa payments.", "APPROVAL_NOT_ALLOWED");
  }

  const provider = getProvider(row.provider);
  const result = await provider.verifyPayment(row, {
    outcome: "successful",
    source: "admin",
  });
  const next = await applyVerifiedResult(row, result);
  return serializePayment(next);
}

async function adminRejectPayment(paymentId, reason) {
  const row = await loadPaymentById(paymentId);

  if (isTerminalStatus(row.status)) {
    return serializePayment(row);
  }

  if (row.provider !== "bank" && row.provider !== "easypaisa") {
    throw new HttpError(400, "Rejection is only available for bank or Easypaisa payments.", "REJECTION_NOT_ALLOWED");
  }

  const provider = getProvider(row.provider);
  const result = await provider.verifyPayment(row, {
    outcome: "failed",
    reason: typeof reason === "string" ? reason : "",
    source: "admin",
  });
  const next = await applyVerifiedResult(row, result);
  return serializePayment(next);
}

module.exports = {
  catalog,
  createOrder,
  getOrder,
  listUserPayments,
  verifyOrder,
  submitBankReference,
  resolveBankPayment,
  launchCheckout,
  handleProviderCallback,
  serializePayment,
  loadPaymentById,
  adminListPayments,
  adminGetPaymentDetails,
  adminApprovePayment,
  adminRejectPayment,
};
