import { createHash, timingSafeEqual } from "node:crypto";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const BASE_DELAY_MS = 750;

type AttemptRecord = {
  count: number;
  windowStart: number;
  lockedUntil: number;
};

const attempts = new Map<string, AttemptRecord>();

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function secureEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length || a.length === 0) return false;
  return timingSafeEqual(a, b);
}

function pruneExpired(now: number): void {
  for (const [key, record] of attempts) {
    if (now - record.windowStart > WINDOW_MS && now >= record.lockedUntil) {
      attempts.delete(key);
    }
  }
}

export type AdminSessionRateLimitResult =
  | { allowed: true; delayMs: number }
  | { allowed: false; retryAfterSeconds: number };

/**
 * Simple in-memory brute-force protection for POST /api/admin/session.
 * Adds a fixed delay on every attempt to slow secret guessing.
 */
export function checkAdminSessionRateLimit(request: Request): AdminSessionRateLimitResult {
  const now = Date.now();
  pruneExpired(now);

  const key = digest(clientKey(request));
  const record = attempts.get(key) ?? { count: 0, windowStart: now, lockedUntil: 0 };

  if (now < record.lockedUntil) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((record.lockedUntil - now) / 1000),
    };
  }

  if (now - record.windowStart > WINDOW_MS) {
    record.count = 0;
    record.windowStart = now;
  }

  record.count += 1;
  attempts.set(key, record);

  if (record.count > MAX_ATTEMPTS) {
    record.lockedUntil = now + WINDOW_MS;
    attempts.set(key, record);
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(WINDOW_MS / 1000),
    };
  }

  return { allowed: true, delayMs: BASE_DELAY_MS };
}

export async function applyAdminSessionDelay(delayMs: number): Promise<void> {
  if (delayMs <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, delayMs));
}

export function resetAdminSessionRateLimit(request: Request): void {
  attempts.delete(digest(clientKey(request)));
}

/** @internal Test helper */
export function verifyAdminSessionRateLimitKey(request: Request, expectedKey: string): boolean {
  return secureEqual(digest(clientKey(request)), expectedKey);
}
