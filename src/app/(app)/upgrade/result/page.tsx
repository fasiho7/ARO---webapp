import { Suspense } from "react";
import { PaymentResult } from "@/components/billing/PaymentResult";

export default function UpgradeResultPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
      <PaymentResult />
    </Suspense>
  );
}
