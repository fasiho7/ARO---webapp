import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE_NAME = "aro_billing_admin";
const ADMIN_COOKIE = ADMIN_COOKIE_NAME;

function apiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000").replace(/\/$/, "");
}

function adminSecret(): string {
  return process.env.BILLING_ADMIN_SECRET ?? "";
}

function configuredSecret(): string {
  const secret = adminSecret().trim();
  if (!secret) {
    throw new Error("BILLING_ADMIN_SECRET is not configured.");
  }
  return secret;
}

function sessionValue(): string {
  return createHash("sha256").update(configuredSecret()).digest("hex");
}

function secureEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length || a.length === 0) return false;
  return timingSafeEqual(a, b);
}

export async function hasAdminSession(): Promise<boolean> {
  const jar = await cookies();
  const value = jar.get(ADMIN_COOKIE)?.value ?? "";
  if (!value) return false;
  return secureEqual(value, sessionValue());
}

export async function setAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, sessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

export function verifySubmittedSecret(secret: string): boolean {
  const trimmed = secret.trim();
  if (!trimmed) return false;
  return secureEqual(trimmed, configuredSecret());
}

export async function proxyAdmin(path: string, init?: RequestInit): Promise<Response> {
  if (!(await hasAdminSession())) {
    return Response.json(
      { success: false, message: "Forbidden. Valid admin session required." },
      { status: 403 },
    );
  }

  const response = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${configuredSecret()}`,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const text = await response.text();
  return new Response(text, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("content-type") ?? "application/json; charset=utf-8",
    },
  });
}
