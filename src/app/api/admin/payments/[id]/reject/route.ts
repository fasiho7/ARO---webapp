import { proxyAdmin } from "@/lib/server/billingAdmin";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = await request.text();
  return proxyAdmin(`/api/billing/admin/payments/${encodeURIComponent(id)}/reject`, {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
