/**
 * Canonical Judge0 CE language IDs.
 * Override with JUDGE0_LANG_CPP, JUDGE0_LANG_C, JUDGE0_LANG_PYTHON, JUDGE0_LANG_JAVA
 * if the configured Judge0 instance uses different IDs.
 */
const DEFAULT_LANGUAGE_IDS = {
  cpp: 54,
  c: 50,
  python: 71,
  java: 62,
};

const ALIASES = {
  "c++": "cpp",
  cpp: "cpp",
  c: "c",
  python: "python",
  python3: "python",
  py: "python",
  java: "java",
};

function envLanguageId(canonical) {
  const name = `JUDGE0_LANG_${canonical.toUpperCase()}`;
  const raw = process.env[name];
  if (!raw || raw.trim().length === 0) {
    return DEFAULT_LANGUAGE_IDS[canonical];
  }
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : DEFAULT_LANGUAGE_IDS[canonical];
}

function resolveLanguage(input) {
  if (typeof input !== "string") {
    return null;
  }
  const canonical = ALIASES[input.trim().toLowerCase()];
  if (!canonical) {
    return null;
  }
  return {
    key: canonical,
    id: envLanguageId(canonical),
  };
}

module.exports = {
  DEFAULT_LANGUAGE_IDS,
  resolveLanguage,
};
