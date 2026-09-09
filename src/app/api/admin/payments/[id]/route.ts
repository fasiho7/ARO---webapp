import { requireAdminCookie } from "@/lib/server/adminCookieGuard";
import { proxyAdmin } from "@/lib/server/billingAdmin";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdminCookie();
  if (denied) return denied;

  const { id } = await context.params;
  return proxyAdmin(`/api/billing/admin/payments/${encodeURIComponent(id)}`);
}
