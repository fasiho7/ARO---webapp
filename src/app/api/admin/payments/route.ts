import { requireAdminCookie } from "@/lib/server/adminCookieGuard";
import { proxyAdmin } from "@/lib/server/billingAdmin";

export async function GET(request: Request) {
  const denied = await requireAdminCookie();
  if (denied) return denied;

  const url = new URL(request.url);
  const query = url.searchParams.toString();
  return proxyAdmin(`/api/billing/admin/payments${query ? `?${query}` : ""}`);
}
