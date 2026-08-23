const { createClient } = require("@supabase/supabase-js");

function isConfiguredValue(value, placeholder) {
  return Boolean(value) && value.trim() !== "" && value !== placeholder;
}

function createSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (
    !isConfiguredValue(url, "your_supabase_project_url") ||
    !isConfiguredValue(anonKey, "your_supabase_anon_key")
  ) {
    return null;
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

const supabase = createSupabaseClient();

function createServiceSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !isConfiguredValue(url, "your_supabase_project_url") ||
    !isConfiguredValue(serviceRoleKey, "")
  ) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

const serviceSupabase = createServiceSupabaseClient();

module.exports = {
  supabase,
  serviceSupabase,
  createSupabaseClient,
  createServiceSupabaseClient,
};
