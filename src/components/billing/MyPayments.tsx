"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  BillingApiError,
  fetchBillingOrders,
  type PaymentRecord,
} from "@/lib/billingApi";

function statusCopy(status: PaymentRecord["status"]): string {
  if (status === "successful") return "Pro Activated";
  if (status === "pending") return "Waiting for admin verification";
  if (status === "failed") return "Payment rejected";
  return "Payment cancelled";
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

export function MyPayments() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchBillingOrders()
      .then((result) => {
        if (cancelled) return;
        setPayments(result.payments);
      })
      .catch((caught: unknown) => {
        if (cancelled) return;
        setError(
          caught instanceof BillingApiError
            ? caught.message
            : "Could not load your payments.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Billing"
        title="My Payments"
        description="Track your manual payment submissions and verification status."
      />

      {error ? (
        <Card>
          <p className="text-sm text-danger">{error}</p>
        </Card>
      ) : null}

      {loading ? <p className="text-sm text-muted">Loading payments…</p> : null}

      {!loading && !error && payments.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">No payments yet.</p>
        </Card>
      ) : null}

      <div className="space-y-4">
        {payments.map((payment) => (
          <Card key={payment.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="display text-lg font-semibold capitalize">{payment.provider}</p>
                <p className="mt-1 text-sm leading-6 text-muted">
                  {payment.currency} {payment.amount}
                </p>
              </div>
              <Badge tone={payment.status === "successful" ? "gold" : "muted"}>
                {payment.status.toUpperCase()}
              </Badge>
            </div>

            <div className="mt-4 grid gap-3 text-sm text-muted md:grid-cols-2">
              <p>Date: {formatDate(payment.createdAt)}</p>
              <p>
                Transaction/reference ID: {payment.providerTransactionId || "Not submitted"}
              </p>
            </div>

            <p className="mt-3 text-sm leading-6 text-muted">{statusCopy(payment.status)}</p>

            {payment.failureReason ? (
              <p className="mt-2 text-sm text-danger">{payment.failureReason}</p>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
