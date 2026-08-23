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

const isDev = process.env.NODE_ENV === "development";
const isDevTesting = isDev && process.env.ENABLE_DEV_PRO_TESTING === "true";

async function attachPlan(req, _res, next) {
  req.plan = "free";
  if (req.userId == null) {
    req.userId = null;
  }

  const token = readAccessToken(req);
  const devUserHeader = req.headers["x-dev-user"];

  if (isDevTesting) {
    let devTarget = null;
    if (typeof devUserHeader === "string") {
      devTarget = devUserHeader.trim().toLowerCase();
    } else if (token === "dev-pro-token") {
      devTarget = "pro";
    } else if (token === "dev-free-token") {
      devTarget = "free";
    }

    if (devTarget === "pro") {
      req.userId = "dev-user-pro-id";
      req.userEmail = "test-pro@aro.local";
      req.plan = "pro";
      next();
      return;
    }

    if (devTarget === "free") {
      req.userId = "dev-user-free-id";
      req.userEmail = "test-free@aro.local";
      req.plan = "free";
      next();
      return;
    }

    if (!token) {
      req.userId = "dev-user-free-id";
      req.userEmail = "test-free@aro.local";
      req.plan = "free";
      next();
      return;
    }
  }

  if (!token) {
    next();
    return;
  }

  const client = userSupabase(token);
  if (!client) {
    if (isDevTesting) {
      req.userId = "dev-user-free-id";
      req.userEmail = "test-free@aro.local";
      req.plan = "free";
    }
    next();
    return;
  }

  try {
    const { data, error } = await client.auth.getUser(token);
    if (error || !data?.user?.id) {
      if (isDevTesting) {
        req.userId = "dev-user-free-id";
        req.userEmail = "test-free@aro.local";
        req.plan = "free";
      }
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
  } catch {
    if (isDevTesting) {
      req.userId = "dev-user-free-id";
      req.userEmail = "test-free@aro.local";
      req.plan = "free";
    }
  }

  next();
}

module.exports = attachPlan;
