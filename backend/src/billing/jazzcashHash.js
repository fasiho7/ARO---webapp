const crypto = require("crypto");
const { timingSafeEqualHex } = require("./shared");

/**
 * Official JazzCash HMAC-SHA256 (sandbox docs):
 * Sort pp_* fields by name, join VALUES with &, prepend integrity salt,
 * HMAC-SHA256 with the salt as key, hex digest.
 * Example from JazzCash: salt 0F5DD14AE2, values 2995&MER123&A48cvE28
 * -> c7689cda7474eb1adcd343fd0c0b676bad0ba66361cc46db589bdb0da4c1c867
 */
function jazzcashSecureHash(fields, integritySalt) {
  const salt = String(integritySalt || "");
  const values = Object.keys(fields)
    .filter((key) => {
      const name = key.toLowerCase();
      return (
        name.startsWith("pp") &&
        name !== "pp_securehash" &&
        fields[key] !== undefined &&
        fields[key] !== null &&
        String(fields[key]) !== ""
      );
    })
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase(), "en"))
    .map((key) => String(fields[key]));
  const message = `${salt}&${values.join("&")}`;
  return crypto.createHmac("sha256", salt).update(message, "utf8").digest("hex");
}

function jazzcashHashValid(fields, integritySalt) {
  const received = fields.pp_SecureHash || fields.pp_secureHash || "";
  const expected = jazzcashSecureHash(fields, integritySalt);
  return timingSafeEqualHex(expected, received);
}

module.exports = {
  jazzcashSecureHash,
  jazzcashHashValid,
};
