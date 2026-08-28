const { createClient } = require("@supabase/supabase-js");
const { normalizePlan } = require("../services/accessControl");

function readAccessToken(req) {
  const header = req.headers.authorization;
  if (typeof header === "string" && header.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }
  return "";
}

function userSupabase(token) {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey || url === "your_supabase_project_url") {
    return null;
  }
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function devTestingEnabled() {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.ENABLE_DEV_PRO_TESTING === "true"
  );
}

function devTestingUserIds() {
  return new Set(
    String(process.env.DEV_PRO_TESTING_USER_IDS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

function requestedDevPlan(req) {
  const value = req.headers["x-aro-dev-test-plan"];
  return value === "free" || value === "pro" ? value : null;
}

async function attachPlan(req, _res, next) {
  req.plan = "free";
  if (req.userId == null) {
    req.userId = null;
  }
  req.devTesting = false;

  const token = readAccessToken(req);

  if (!token) {
    next();
    return;
  }

  const client = userSupabase(token);
  if (!client) {
    next();
    return;
  }

  try {
    const { data, error } = await client.auth.getUser(token);
    if (error || !data?.user?.id) {
      next();
      return;
    }
    req.userId = data.user.id;
    const { data: profile } = await client
      .from("profiles")
      .select("plan")
      .eq("id", data.user.id)
      .maybeSingle();
    req.plan = normalizePlan(profile?.plan);
    const devPlan = requestedDevPlan(req);
    if (devTestingEnabled() && devPlan && devTestingUserIds().has(req.userId)) {
      req.plan = devPlan;
      req.devTesting = true;
    }
  } catch {
    // Leave the request unauthenticated; requireAuth decides whether to reject it.
  }

  next();
}

module.exports = attachPlan;
