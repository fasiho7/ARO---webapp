import { proxyAdmin } from "@/lib/server/billingAdmin";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return proxyAdmin(`/api/billing/admin/payments/${encodeURIComponent(id)}`);
}
