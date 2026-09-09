import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/server/billingAdmin";

export { ADMIN_COOKIE_NAME } from "@/lib/server/billingAdmin";

/**
 * Validates the httpOnly admin session cookie on protected /api/admin/* routes.
 * Returns a 403 response when the cookie is missing or invalid; null when allowed.
 */
export async function requireAdminCookie(): Promise<NextResponse | null> {
  if (!(await hasAdminSession())) {
    return NextResponse.json(
      { success: false, message: "Forbidden. Valid admin session required." },
      { status: 403 },
    );
  }
  return null;
}
