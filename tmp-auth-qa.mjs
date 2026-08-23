import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function parseEnv(file) {
  const out = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function jsonReq(url, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const r = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = {};
  try {
    json = await r.json();
  } catch {
    json = {};
  }
  return { status: r.status, json };
}

async function pageCheck(path, cookie) {
  const r = await fetch(`http://localhost:3000${path}`, {
    redirect: "manual",
    headers: cookie ? { Cookie: cookie } : {},
  });
  return { status: r.status, loc: r.headers.get("location") };
}

const fe = parseEnv("c:/Users/PERSONAL/Desktop/ARO/.env.local");
const be = parseEnv("c:/Users/PERSONAL/Desktop/ARO/backend/.env");
const url = fe.NEXT_PUBLIC_SUPABASE_URL || be.SUPABASE_URL;
const anon = fe.NEXT_PUBLIC_SUPABASE_ANON_KEY || be.SUPABASE_ANON_KEY;
const api = (fe.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
const origin = "http://localhost:3000";

const report = {
  env: {
    frontendSupabase: Boolean(url && fe.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    backendAnon: Boolean(be.SUPABASE_ANON_KEY && be.SUPABASE_ANON_KEY !== "your_supabase_anon_key"),
    backendServiceRole: Boolean(be.SUPABASE_SERVICE_ROLE_KEY),
  },
};

if (!url || !anon) {
  report.blocker = "Supabase env missing";
  console.log(JSON.stringify(report));
  process.exit(1);
}

const supabase = createClient(url, anon, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const email = `aro.qa.${Date.now()}@gmail.com`;
const password = "AroQaTest123";
const nl = "\n";
const pfId = "pf/variables-data-types/sum-of-two-numbers";
const pfRight = `a,b=map(int,input().split())${nl}print(a+b)`;

try {
  report.cors = await fetch(`${api}/api/access/me`, {
    headers: { Origin: origin },
  }).then(async (r) => ({
    status: r.status,
    acao: r.headers.get("access-control-allow-origin"),
  }));

  report.protectedRoutesGuest = {
    dashboard: await pageCheck("/dashboard"),
    coding: await pageCheck("/coding"),
  };

  const signUp = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: "Aro QA Student" },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });
  report.signup = {
    error: signUp.error?.message ?? null,
    hasUser: Boolean(signUp.data.user),
    hasSession: Boolean(signUp.data.session),
  };

  if (signUp.error || !signUp.data.user) {
    report.blocker = signUp.error?.message ?? "signup failed";
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  let session = signUp.data.session;
  if (!session) {
    const login = await supabase.auth.signInWithPassword({ email, password });
    report.loginAfterSignup = {
      error: login.error?.message ?? null,
      hasSession: Boolean(login.data.session),
    };
    session = login.data.session;
  }

  if (!session?.access_token) {
    report.blocker = "No session after signup/login";
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  const userId = signUp.data.user.id;
  const token = session.access_token;
  report.session = { pass: true };

  const profile = await supabase
    .from("profiles")
    .select("id, plan, full_name")
    .eq("id", userId)
    .maybeSingle();
  report.profile = {
    error: profile.error?.message ?? null,
    exists: Boolean(profile.data),
    plan: profile.data?.plan ?? null,
  };

  report.backendAccessMe = await jsonReq(`${api}/api/access/me`, { token });

  await sleep(1600);
  report.pfSubmit = await jsonReq(`${api}/api/coding/submit`, {
    method: "POST",
    token,
    body: { language: "Python", sourceCode: pfRight, problemId: pfId },
  });

  const accepted = report.pfSubmit.json?.status === "accepted";
  const completed = accepted ? [pfId] : [];
  const save = await supabase.from("coding_progress").upsert(
    { user_id: userId, completed_ids: completed },
    { onConflict: "user_id" },
  );
  report.progressSave = {
    accepted,
    upsertError: save.error?.message ?? null,
  };

  const read1 = await supabase
    .from("coding_progress")
    .select("completed_ids")
    .eq("user_id", userId)
    .maybeSingle();
  report.progressReadAfterSave = {
    error: read1.error?.message ?? null,
    hasPf: Array.isArray(read1.data?.completed_ids)
      ? read1.data.completed_ids.includes(pfId)
      : false,
  };

  const planHack = await supabase
    .from("profiles")
    .update({ plan: "pro" })
    .eq("id", userId)
    .select("id, plan");
  const planAfter = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .maybeSingle();
  report.planLock = {
    updateError: planHack.error?.message ?? null,
    returnedRows: Array.isArray(planHack.data) ? planHack.data.length : null,
    planAfter: planAfter.data?.plan ?? null,
  };

  report.proLocks = {
    medium: await jsonReq(`${api}/api/coding/submit`, {
      method: "POST",
      token,
      body: {
        language: "Python",
        sourceCode: "print(1)",
        problemId: "pf/input-output/seconds-to-hms",
      },
    }),
    hard: await jsonReq(`${api}/api/coding/submit`, {
      method: "POST",
      token,
      body: {
        language: "Python",
        sourceCode: "print(1)",
        problemId: "pf/hard/does-not-exist",
      },
    }),
    dryRun: await jsonReq(`${api}/api/coding/dry-run`, {
      method: "POST",
      token,
      body: { language: "Python", sourceCode: "print(1)", stdin: "" },
    }),
    ai: await jsonReq(`${api}/api/ai-tutor`, {
      method: "POST",
      token,
      body: { message: "hello" },
    }),
    roadmapInt: await jsonReq(`${api}/api/access/check`, {
      method: "POST",
      token,
      body: { feature: "roadmapTopic", difficulty: "Intermediate" },
    }),
    roadmapAdv: await jsonReq(`${api}/api/access/check`, {
      method: "POST",
      token,
      body: { feature: "roadmapTopic", difficulty: "Advanced" },
    }),
  };

  await supabase.auth.signOut();
  report.logout = { ok: true };

  const login2 = await supabase.auth.signInWithPassword({ email, password });
  report.relogin = {
    error: login2.error?.message ?? null,
    hasSession: Boolean(login2.data.session),
  };

  const read2 = await supabase
    .from("coding_progress")
    .select("completed_ids")
    .eq("user_id", userId)
    .maybeSingle();
  report.progressAfterRelogin = {
    error: read2.error?.message ?? null,
    hasPf: Array.isArray(read2.data?.completed_ids)
      ? read2.data.completed_ids.includes(pfId)
      : false,
    ids: read2.data?.completed_ids ?? null,
  };

  const profile2 = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .maybeSingle();
  report.planAfterRelogin = profile2.data?.plan ?? null;

  report.pages = {
    landing: await pageCheck("/"),
    login: await pageCheck("/login"),
    dashboardGuest: await pageCheck("/dashboard"),
  };
} catch (error) {
  report.uncaught = error instanceof Error ? error.message : "unknown";
}

console.log(JSON.stringify(report, null, 2));
