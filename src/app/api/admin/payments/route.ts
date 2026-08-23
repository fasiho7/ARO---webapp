import { proxyAdmin } from "@/lib/server/billingAdmin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.toString();
  return proxyAdmin(`/api/billing/admin/payments${query ? `?${query}` : ""}`);
}
