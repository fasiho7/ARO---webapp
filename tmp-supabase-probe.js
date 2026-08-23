const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const txt = fs.readFileSync("c:/Users/PERSONAL/Desktop/ARO/backend/.env", "utf8");
const map = {};
for (const line of txt.split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i < 1) continue;
  map[t.slice(0,i)] = t.slice(i+1).trim();
}
const url = map.SUPABASE_URL || "";
const key = map.SUPABASE_ANON_KEY || "";
const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
(async () => {
  try {
    const { data, error, status } = await client.from("profiles").select("id").limit(1);
    console.log(JSON.stringify({ ok: !error, status: status ?? null, error: error ? { message: error.message, code: error.code } : null, rows: Array.isArray(data) ? data.length : null }));
  } catch (e) {
    console.log(JSON.stringify({ ok: false, name: e.name, message: e.message, code: e.code || null, causeCode: e.cause?.code || null }));
  }
})();
