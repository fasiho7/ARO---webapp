const { serviceSupabase } = require("./supabase");
const { HttpError } = require("../utils/httpError");

const BUCKET_NAME = "payment-proofs";

function requireStorage() {
  if (!serviceSupabase) {
    throw new HttpError(
      503,
      "Storage is not configured. Set SUPABASE_SERVICE_ROLE_KEY in backend/.env.",
      "STORAGE_NOT_CONFIGURED",
    );
  }
  return serviceSupabase;
}

async function ensureBucket() {
  const admin = requireStorage();

  try {
    const { data: buckets, error: listError } =
      await admin.storage.listBuckets();

    if (listError) {
      throw new HttpError(
        503,
        "Could not list storage buckets.",
        "BUCKET_LIST_FAILED",
      );
    }

    const exists = buckets.some((b) => b.name === BUCKET_NAME);
    if (exists) {
      return { created: false, bucket: BUCKET_NAME };
    }

    const { error: createError } = await admin.storage.createBucket(
      BUCKET_NAME,
      {
        public: false,
        fileSizeLimit: null,
        allowedMimeTypes: null,
      },
    );

    if (createError) {
      if (createError.message?.includes("already exists")) {
        return { created: false, bucket: BUCKET_NAME };
      }
      throw new HttpError(
        503,
        "Could not create payment-proofs storage bucket.",
        "BUCKET_CREATE_FAILED",
      );
    }

    return { created: true, bucket: BUCKET_NAME };
  } catch (err) {
    if (err instanceof HttpError) {
      throw err;
    }
    throw new HttpError(
      503,
      "Storage bucket initialization failed.",
      "BUCKET_INIT_FAILED",
    );
  }
}

function safeExtFromContentType(contentType) {
  const map = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/heic": "heic",
  };
  return map[contentType] || null;
}

async function uploadProof(
  fileBuffer,
  userId,
  paymentId,
  contentType,
  ext = null,
) {
  const admin = requireStorage();

  if (!Buffer.isBuffer(fileBuffer)) {
    throw new HttpError(400, "Invalid file data.", "INVALID_FILE_BUFFER");
  }

  if (typeof userId !== "string" || !userId.trim()) {
    throw new HttpError(400, "Invalid user id.", "INVALID_USER_ID");
  }

  if (typeof paymentId !== "string" || !paymentId.trim()) {
    throw new HttpError(400, "Invalid payment id.", "INVALID_PAYMENT_ID");
  }

  if (typeof contentType !== "string" || !contentType.trim()) {
    throw new HttpError(400, "Invalid content type.", "INVALID_CONTENT_TYPE");
  }

  const safeExt = ext && typeof ext === "string"
    ? ext.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()
    : safeExtFromContentType(contentType);

  if (!safeExt) {
    throw new HttpError(400, "Unsupported file type.", "UNSUPPORTED_FILE_TYPE");
  }

  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, "_");
  const safePaymentId = paymentId.replace(/[^a-zA-Z0-9_-]/g, "_");
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 10);
  const path = `${safeUserId}/${safePaymentId}/${timestamp}-${random}.${safeExt}`;

  try {
    const { error: uploadError } = await admin.storage
      .from(BUCKET_NAME)
      .upload(path, fileBuffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      throw new HttpError(
        503,
        "Could not upload payment proof.",
        "UPLOAD_FAILED",
      );
    }

    const { data: urlData } = admin.storage.from(BUCKET_NAME).getPublicUrl(path);

    return {
      path,
      url: urlData?.publicUrl || null,
    };
  } catch (err) {
    if (err instanceof HttpError) {
      throw err;
    }
    throw new HttpError(
      503,
      "Payment proof upload failed.",
      "UPLOAD_FAILED",
    );
  }
}

async function generateSignedDownloadUrl(path, expiresIn = 3600) {
  const admin = requireStorage();

  if (typeof path !== "string" || !path.trim()) {
    throw new HttpError(400, "Invalid file path.", "INVALID_FILE_PATH");
  }

  try {
    const { data, error } = await admin.storage
      .from(BUCKET_NAME)
      .createSignedUrl(path, expiresIn);

    if (error || !data?.signedUrl) {
      throw new HttpError(
        503,
        "Could not generate download link.",
        "SIGNED_URL_FAILED",
      );
    }

    return data.signedUrl;
  } catch (err) {
    if (err instanceof HttpError) {
      throw err;
    }
    throw new HttpError(
      503,
      "Download link generation failed.",
      "SIGNED_URL_FAILED",
    );
  }
}

async function deleteProof(path) {
  const admin = requireStorage();

  if (typeof path !== "string" || !path.trim()) {
    throw new HttpError(400, "Invalid file path.", "INVALID_FILE_PATH");
  }

  try {
    const { error } = await admin.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      throw new HttpError(
        503,
        "Could not delete payment proof.",
        "DELETE_FAILED",
      );
    }

    return { success: true, path };
  } catch (err) {
    if (err instanceof HttpError) {
      throw err;
    }
    throw new HttpError(
      503,
      "Payment proof deletion failed.",
      "DELETE_FAILED",
    );
  }
}

module.exports = {
  BUCKET_NAME,
  ensureBucket,
  uploadProof,
  generateSignedDownloadUrl,
  deleteProof,
  safeExtFromContentType,
};
