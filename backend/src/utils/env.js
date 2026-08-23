const REQUIRED = ["CLIENT_URL", "SUPABASE_URL", "SUPABASE_ANON_KEY"];

function validateEnv() {
  const missing = REQUIRED.filter((name) => {
    const value = process.env[name];
    return !value || value.trim().length === 0;
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. Check backend/.env`,
    );
  }
}

module.exports = {
  validateEnv,
};
