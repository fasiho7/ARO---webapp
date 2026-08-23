const { supabase } = require("../config/supabase");

async function optionalAiUser(req, _res, next) {
  req.userId = null;
  if (!supabase) {
    next();
    return;
  }

  const header = req.headers.authorization;
  const token =
    typeof header === "string" && header.startsWith("Bearer ")
      ? header.slice(7).trim()
      : "";

  if (!token) {
    next();
    return;
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (!error && data?.user?.id) {
      req.userId = data.user.id;
    }
  } catch {
    console.error("AI tutor auth lookup failed");
  }

  next();
}

module.exports = optionalAiUser;
