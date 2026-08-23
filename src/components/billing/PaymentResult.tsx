"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  BillingApiError,
  fetchBillingOrder,
  verifyBillingOrder,
  type PaymentRecord,
} from "@/lib/billingApi";

function titleFor(status: PaymentRecord["status"] | "unknown"): string {
  if (status === "successful") {
    return "You're now on Aro Pro";
  }
  if (status === "failed") {
    return "Payment failed";
  }
  if (status === "cancelled") {
    return "Payment cancelled";
  }
  if (status === "pending") {
    return "Payment pending";
  }
  return "Payment";
}

export function PaymentResult() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const { refreshProfile, profile } = useAuth();
  const [payment, setPayment] = useState<PaymentRecord | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      setError("This page does not take payment status from the URL.");
      return;
    }
    const paymentId = orderId;
    let cancelled = false;
    async function load() {
      try {
        const verified = await verifyBillingOrder(paymentId);
        if (cancelled) {
          return;
        }
        setPayment(verified.payment);
        if (verified.payment.status === "successful") {
          await refreshProfile();
        }
      } catch (caught: unknown) {
        try {
          const fetched = await fetchBillingOrder(paymentId);
          if (cancelled) {
            return;
          }
          setPayment(fetched.payment);
        } catch {
          if (!cancelled) {
            setError(
              caught instanceof BillingApiError
                ? caught.message
                : "Could not load this payment.",
            );
          }
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [orderId, refreshProfile]);

  const status = payment?.status ?? "unknown";
  const alreadyPro = profile?.plan === "pro";

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        eyebrow="Pro"
        title={alreadyPro && status !== "successful" ? "You're now on Aro Pro" : titleFor(status)}
        description="Aro only unlocks Pro after the server verifies the transaction. Return URLs and query parameters are not proof of payment."
      />
      <Card>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {payment ? (
          <>
            <p className="font-mono text-[11px] tracking-wide text-gold uppercase">
              {payment.status}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              {payment.currency} {payment.amount} · {payment.provider}
            </p>
            {payment.failureReason ? (
              <p className="mt-2 text-sm text-danger">{payment.failureReason}</p>
            ) : null}
            {payment.status === "pending" ? (
              <p className="mt-2 text-sm leading-6 text-muted">
                This payment is not complete. Your plan stays Free until it is
                verified.
              </p>
            ) : null}
            {payment.status === "failed" || payment.status === "cancelled" ? (
              <p className="mt-2 text-sm leading-6 text-muted">
                Your plan was not changed.
              </p>
            ) : null}
          </>
        ) : !error ? (
          <p className="text-sm text-muted">Checking payment…</p>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-3">
          {status === "successful" || alreadyPro ? (
            <Button href="/dashboard">Back to Aro</Button>
          ) : (
            <Button href="/upgrade" variant="secondary">
              Back to upgrade
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
