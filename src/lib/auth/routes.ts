export const DEFAULT_AUTH_REDIRECT = "/dashboard";

export const protectedPathPrefixes = [
  "/dashboard",
  "/tutor",
  "/ai-tutor",
  "/roadmaps",
  "/coding",
  "/progress",
  "/awards",
  "/payments",
  "/admin",
  "/profile",
  "/settings",
  "/upgrade",
  "/quiz",
] as const;

export function isProtectedPath(pathname: string): boolean {
  return protectedPathPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isAuthPath(pathname: string): boolean {
  return pathname === "/login" || pathname === "/signup";
}

/** Only allow in-app relative paths. Blocks open redirects. */
export function safeNextPath(value: string | null | undefined): string {
  if (!value) {
    return DEFAULT_AUTH_REDIRECT;
  }
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
    return DEFAULT_AUTH_REDIRECT;
  }
  if (isAuthPath(value) || value.startsWith("/auth/")) {
    return DEFAULT_AUTH_REDIRECT;
  }
  return value;
}
