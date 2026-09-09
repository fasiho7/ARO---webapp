const {
  uploadProof,
  generateSignedDownloadUrl,
  deleteProof,
  ensureBucket,
  safeExtFromContentType,
} = require("../config/storage");
const { HttpError } = require("../utils/httpError");
const { serviceSupabase } = require("../config/supabase");
const { sendProofSubmittedEmail } = require("./emailService");

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
];

const MAX_FILE_SIZE = 8 * 1024 * 1024;

const EXECUTABLE_EXTENSIONS = new Set([
  "exe", "msi", "bat", "cmd", "com", "pif", "scr", "vbs", "js", "jse",
  "wsf", "wsh", "ps1", "psc1", "psm1", "psd1", "sh", "bash", "zsh", "ksh",
  "csh", "tcsh", "py", "pyc", "pyo", "pyd", "rb", "rbb", "pl", "pm", "t",
  "cgi", "php", "php3", "php4", "php5", "phtml", "shtml", "jsp", "asp",
  "aspx", "axd", "asmx", "ashx", "cfm", "cfc", "dll", "so", "dylib",
  "bin", "app", "jar", "class", "war", "ear", "ade", "adp", "chm", "cpl",
  "crt", "hlp", "inf", "ins", "isp", "jse", "lnk", "mde", "msc", "msi",
  "msp", "mst", "pcd", "reg", "scf", "sct", "shb", "shs", "url", "vb",
  "vbe", "vbs", "wsc", "wsf", "wsh",
]);

const EXECUTABLE_MIME_PREFIXES = [
  "application/x-executable",
  "application/x-msdownload",
  "application/x-sh",
  "application/x-bash",
  "application/x-perl",
  "application/x-python",
  "application/x-php",
  "application/x-javascript",
  "application/x-httpd-cgi",
  "text/x-script",
  "application/x-mach-binary",
  "application/x-elf",
  "application/x-dosexec",
];

const MAGIC_BYTES = [
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { mime: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38] },
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46], offset: 0, suffix: "WEBP" },
  { mime: "image/heic", bytes: [0x00, 0x00, 0x00], suffixCheck: true },
];

function checkMagicBytes(buffer, declaredMime) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 4) {
    return false;
  }

  const head = buffer.slice(0, 16);

  if (declaredMime === "image/jpeg") {
    return head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
  }

  if (declaredMime === "image/png") {
    return (
      head[0] === 0x89 &&
      head[1] === 0x50 &&
      head[2] === 0x4e &&
      head[3] === 0x47 &&
      head[4] === 0x0d &&
      head[5] === 0x0a &&
      head[6] === 0x1a &&
      head[7] === 0x0a
    );
  }

  if (declaredMime === "image/gif") {
    return (
      head[0] === 0x47 &&
      head[1] === 0x49 &&
      head[2] === 0x46 &&
      head[3] === 0x38 &&
      (head[4] === 0x37 || head[4] === 0x39)
    );
  }

  if (declaredMime === "image/webp") {
    if (buffer.length < 12) return false;
    const riff = head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46;
    const webp =
      head[8] === 0x57 && head[9] === 0x45 && head[10] === 0x42 && head[11] === 0x50;
    return riff && webp;
  }

  if (declaredMime === "image/heic") {
    if (buffer.length < 12) return false;
    const ftyp =
      head[4] === 0x66 &&
      head[5] === 0x74 &&
      head[6] === 0x79 &&
      head[7] === 0x70;
    const brand =
      (head[8] === 0x68 && head[9] === 0x65 && head[10] === 0x69 && head[11] === 0x63) ||
      (head[8] === 0x68 && head[9] === 0x65 && head[10] === 0x76 && head[11] === 0x63) ||
      (head[8] === 0x68 && head[9] === 0x65 && head[10] === 0x69 && head[11] === 0x78) ||
      (head[8] === 0x6d && head[9] === 0x69 && head[10] === 0x66 && head[11] === 0x31);
    return ftyp && brand;
  }

  return false;
}

function isExecutableMime(mimeType) {
  if (!mimeType) return false;
  const lower = mimeType.toLowerCase();
  return EXECUTABLE_MIME_PREFIXES.some((prefix) => lower.startsWith(prefix));
}

function isExecutableExt(ext) {
  if (!ext) return false;
  const clean = ext.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  return EXECUTABLE_EXTENSIONS.has(clean);
}

function validateFile(fileBuffer, contentType, originalFilename = null) {
  if (!Buffer.isBuffer(fileBuffer)) {
    throw new HttpError(400, "Invalid file data.", "INVALID_FILE");
  }

  if (fileBuffer.length === 0) {
    throw new HttpError(400, "File is empty.", "EMPTY_FILE");
  }

  if (fileBuffer.length > MAX_FILE_SIZE) {
    throw new HttpError(
      400,
      `File too large. Maximum size is 8MB (${MAX_FILE_SIZE} bytes).`,
      "FILE_TOO_LARGE",
    );
  }

  if (typeof contentType !== "string" || !contentType.trim()) {
    throw new HttpError(400, "Missing content type.", "MISSING_CONTENT_TYPE");
  }

  const normalizedMime = contentType.toLowerCase().trim().split(";")[0].trim();

  if (!ALLOWED_MIME_TYPES.includes(normalizedMime)) {
    throw new HttpError(
      400,
      `Unsupported file type: ${normalizedMime}. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}.`,
      "UNSUPPORTED_FILE_TYPE",
    );
  }

  if (isExecutableMime(normalizedMime)) {
    throw new HttpError(400, "Executable files are not allowed.", "EXECUTABLE_BLOCKED");
  }

  const safeExt = safeExtFromContentType(normalizedMime);
  if (!safeExt) {
    throw new HttpError(
      400,
      "Could not determine a safe file extension from content type.",
      "NO_SAFE_EXTENSION",
    );
  }

  if (isExecutableExt(safeExt)) {
    throw new HttpError(400, "Executable extensions are not allowed.", "EXECUTABLE_EXT_BLOCKED");
  }

  if (originalFilename && typeof originalFilename === "string") {
    const nameParts = originalFilename.toLowerCase().split(".");
    if (nameParts.length > 1) {
      const nameExt = nameParts.pop().replace(/[^a-zA-Z0-9]/g, "");
      if (nameExt && isExecutableExt(nameExt)) {
        throw new HttpError(
          400,
          "Suspicious file extension detected in filename.",
          "SUSPICIOUS_EXTENSION",
        );
      }
    }
    if (originalFilename.includes("..") || /[\/\\]/.test(originalFilename)) {
      throw new HttpError(400, "Invalid filename.", "INVALID_FILENAME");
    }
  }

  if (!checkMagicBytes(fileBuffer, normalizedMime)) {
    throw new HttpError(
      400,
      "File content does not match declared image type.",
      "CONTENT_MISMATCH",
    );
  }

  return {
    mimeType: normalizedMime,
    safeExt,
    size: fileBuffer.length,
  };
}

async function requirePaymentOwnership(userId, paymentId) {
  if (!serviceSupabase) {
    throw new HttpError(
      503,
      "Payment verification is not configured. Set SUPABASE_SERVICE_ROLE_KEY in backend/.env.",
      "PAYMENT_VERIFY_NOT_CONFIGURED",
    );
  }

  const { data, error } = await serviceSupabase
    .from("payments")
    .select("id, user_id, status, provider, metadata")
    .eq("id", paymentId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new HttpError(503, "Could not verify payment ownership.", "PAYMENT_VERIFY_FAILED");
  }

  if (!data) {
    throw new HttpError(404, "Payment not found.", "PAYMENT_NOT_FOUND");
  }

  return data;
}

async function uploadPaymentProof(userId, paymentId, fileBuffer, contentType, originalFilename) {
  const payment = await requirePaymentOwnership(userId, paymentId);

  if (payment.status !== "pending") {
    throw new HttpError(
      409,
      "Only pending manual payments can accept proof uploads.",
      "PAYMENT_NOT_PENDING",
    );
  }

  if (payment.provider !== "bank" && payment.provider !== "easypaisa") {
    throw new HttpError(
      400,
      "Proof uploads are only available for Easypaisa or bank transfer payments.",
      "WRONG_PAYMENT_PROVIDER",
    );
  }

  const validated = validateFile(fileBuffer, contentType, originalFilename);

  try {
    await ensureBucket();
  } catch (err) {
    if (err.code !== "STORAGE_NOT_CONFIGURED" && err.code !== "BUCKET_INIT_FAILED") {
      throw err;
    }
  }

  const result = await uploadProof(
    fileBuffer,
    userId,
    paymentId,
    validated.mimeType,
    validated.safeExt,
  );

  try {
    await serviceSupabase
      .from("payments")
      .update({
        metadata: {
          ...(payment.metadata && typeof payment.metadata === "object" ? payment.metadata : {}),
          proofPath: result.path,
          proofUploadedAt: new Date().toISOString(),
          proofMimeType: validated.mimeType,
          proofSize: validated.size,
        },
      })
      .eq("id", paymentId);
  } catch (err) {
    try {
      await deleteProof(result.path);
    } catch (_) {
    }
    throw new HttpError(
      503,
      "Could not record proof upload. Please try again.",
      "PROOF_RECORD_FAILED",
    );
  }

  // Fire-and-forget admin notification email. Never let email failure
  // block or roll back a successful proof upload.
  (async () => {
    try {
      const { data: profile } = await serviceSupabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", userId)
        .maybeSingle();

      const { data: pmtRow } = await serviceSupabase
        .from("payments")
        .select("amount, currency, provider, created_at")
        .eq("id", paymentId)
        .maybeSingle();

      await sendProofSubmittedEmail({
        userName: profile?.full_name || null,
        userEmail: profile?.email || null,
        amount: pmtRow?.amount ?? 499,
        currency: pmtRow?.currency ?? "PKR",
        provider: pmtRow?.provider ?? payment.provider,
        paymentId,
        createdAt: pmtRow?.created_at || new Date().toISOString(),
      });
    } catch (emailErr) {
      console.error("[proofService] Admin notification email failed:", emailErr?.message ?? emailErr);
    }
  })();

  return {
    path: result.path,
    url: null,
    size: validated.size,
    mimeType: validated.mimeType,
  };
}

async function getProofDownloadUrl(userId, paymentId) {
  const payment = await requirePaymentOwnership(userId, paymentId);

  const proofPath = payment.metadata?.proofPath;
  if (!proofPath || typeof proofPath !== "string" || !proofPath.trim()) {
    throw new HttpError(404, "No payment proof found for this order.", "PROOF_NOT_FOUND");
  }

  const signedUrl = await generateSignedDownloadUrl(proofPath, 3600);

  return {
    url: signedUrl,
    expiresIn: 3600,
    mimeType: payment.metadata?.proofMimeType || null,
    size: payment.metadata?.proofSize || null,
    uploadedAt: payment.metadata?.proofUploadedAt || null,
  };
}

async function deletePaymentProof(userId, paymentId) {
  const payment = await requirePaymentOwnership(userId, paymentId);

  const proofPath = payment.metadata?.proofPath;
  if (!proofPath || typeof proofPath !== "string" || !proofPath.trim()) {
    throw new HttpError(404, "No payment proof found for this order.", "PROOF_NOT_FOUND");
  }

  await deleteProof(proofPath);

  const { error: updateError } = await serviceSupabase
    .from("payments")
    .update({
      metadata: {
        ...(payment.metadata && typeof payment.metadata === "object" ? payment.metadata : {}),
        proofPath: null,
        proofUploadedAt: null,
        proofMimeType: null,
        proofSize: null,
        proofDeletedAt: new Date().toISOString(),
      },
    })
    .eq("id", paymentId);

  if (updateError) {
    throw new HttpError(
      503,
      "Proof file was deleted, but payment record could not be updated.",
      "PROOF_RECORD_UPDATE_FAILED",
    );
  }

  return { success: true, paymentId };
}

async function adminGetProofDownloadUrl(paymentId) {
  if (!serviceSupabase) {
    throw new HttpError(
      503,
      "Storage is not configured. Set SUPABASE_SERVICE_ROLE_KEY in backend/.env.",
      "STORAGE_NOT_CONFIGURED",
    );
  }

  const { data, error } = await serviceSupabase
    .from("payments")
    .select("id, metadata")
    .eq("id", paymentId)
    .maybeSingle();

  if (error) {
    throw new HttpError(503, "Could not load payment.", "PAYMENT_LOOKUP_FAILED");
  }

  if (!data) {
    throw new HttpError(404, "Payment not found.", "PAYMENT_NOT_FOUND");
  }

  const proofPath = data.metadata?.proofPath;
  if (!proofPath || typeof proofPath !== "string" || !proofPath.trim()) {
    throw new HttpError(404, "No payment proof found for this order.", "PROOF_NOT_FOUND");
  }

  const signedUrl = await generateSignedDownloadUrl(proofPath, 86400);

  return {
    url: signedUrl,
    expiresIn: 86400,
    mimeType: data.metadata?.proofMimeType || null,
    size: data.metadata?.proofSize || null,
    uploadedAt: data.metadata?.proofUploadedAt || null,
    paymentId: data.id,
  };
}

module.exports = {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  validateFile,
  uploadPaymentProof,
  getProofDownloadUrl,
  deletePaymentProof,
  adminGetProofDownloadUrl,
  checkMagicBytes,
  isExecutableMime,
  isExecutableExt,
};
