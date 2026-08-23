const crypto = require("crypto");

/**
 * Official Easypaisa Index.jsf merchantHashedReq:
 * Sort request fields alphabetically, join as key=value with &,
 * encrypt with AES/ECB/PKCS5Padding using the merchant hash key.
 */
function easypaisaMerchantHash(fields, hashKey) {
  const keyBytes = Buffer.from(String(hashKey || ""), "utf8");
  if (![16, 24, 32].includes(keyBytes.length)) {
    throw new Error(
      "EASYPAISA_HASH_KEY must be 16, 24, or 32 bytes for AES hashing.",
    );
  }
  const algorithm =
    keyBytes.length === 16
      ? "aes-128-ecb"
      : keyBytes.length === 24
        ? "aes-192-ecb"
        : "aes-256-ecb";
  const sorted = Object.keys(fields)
    .filter((key) => key !== "merchantHashedReq" && fields[key] !== undefined && fields[key] !== "")
    .sort((a, b) => a.localeCompare(b, "en"));
  const payload = sorted.map((key) => `${key}=${fields[key]}`).join("&");
  const cipher = crypto.createCipheriv(algorithm, keyBytes, null);
  cipher.setAutoPadding(true);
  return Buffer.concat([cipher.update(payload, "utf8"), cipher.final()]).toString(
    "base64",
  );
}

module.exports = {
  easypaisaMerchantHash,
};
