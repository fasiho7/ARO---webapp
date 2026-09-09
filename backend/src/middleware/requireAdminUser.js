/**
 * requireAdminUser — middleware that:
 *   1. Reads the Supabase JWT from the Authorization: Bearer header.
 *   2. Calls supabase.auth.getUser() to verify the token server-side.
 *   3. Queries profiles.is_admin from the DB using the service role.
 *
 * Rejects with 401 if not authenticated, 403 if authenticated but not admin.
 * Never trusts the request body, query string, or localStorage for role checks.
 */

const { createClient } = require("@supabase/supabase-js");
const { serviceSupabase } = require("../config/supabase");
const { HttpError } = require("../utils/httpError");

function readBearerToken(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }
  return "";
}

function userSupabase(token) {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function requireAdminUser(req, _res, next) {
  const token = readBearerToken(req);
  if (!token) {
    return next(new HttpError(401, "Sign in to access the admin dashboard.", "AUTH_REQUIRED"));
  }

  const client = userSupabase(token);
  if (!client) {
    return next(new HttpError(503, "Auth service is not configured.", "AUTH_NOT_CONFIGURED"));
  }

  let userId;
  try {
    const { data, error } = await client.auth.getUser(token);
    if (error || !data?.user?.id) {
      return next(new HttpError(401, "Session expired. Sign in again.", "AUTH_INVALID"));
    }
    userId = data.user.id;
  } catch {
    return next(new HttpError(401, "Could not verify your session.", "AUTH_VERIFY_FAILED"));
  }

  if (!serviceSupabase) {
    return next(new HttpError(503, "Admin database is not configured.", "ADMIN_DB_NOT_CONFIGURED"));
  }

  try {
    const { data: profile, error: profileError } = await serviceSupabase
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      return next(new HttpError(503, "Could not verify admin status.", "ADMIN_LOOKUP_FAILED"));
    }

    if (!profile?.is_admin) {
      return next(new HttpError(403, "Admin access only.", "ADMIN_REQUIRED"));
    }
  } catch {
    return next(new HttpError(503, "Could not verify admin status.", "ADMIN_LOOKUP_FAILED"));
  }

  req.userId = userId;
  next();
}

module.exports = requireAdminUser;
