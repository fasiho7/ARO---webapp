"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import type { PaymentRecord } from "@/lib/billingApi";

type AdminPaymentDetail = {
  payment: PaymentRecord;
  user: {
    id: string;
    email: string | null;
    fullName: string | null;
    plan: "free" | "pro";
    createdAt: string | null;
  };
  hasProof: boolean;
};

type ListResponse = {
  success: true;
  payments: PaymentRecord[];
  total: number;
  pendingCount: number;
};

async function readJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  const payload = (await response.json()) as T & { success?: boolean; message?: string };
  if (!response.ok || payload.success === false) {
    throw new Error((payload as { message?: string }).message || "Request failed.");
  }
  return payload;
}

function sortPendingFirst(items: AdminPaymentDetail[]): AdminPaymentDetail[] {
  return [...items].sort((left, right) => {
    const leftPending = left.payment.status === "pending" ? 0 : 1;
    const rightPending = right.payment.status === "pending" ? 0 : 1;
    if (leftPending !== rightPending) return leftPending - rightPending;
    return right.payment.createdAt.localeCompare(left.payment.createdAt);
  });
}

export function AdminPayments() {
  const [secret, setSecret] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [payments, setPayments] = useState<AdminPaymentDetail[]>([]);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  async function loadPayments() {
    setLoading(true);
    setError("");
    try {
      const list = await readJson<ListResponse>("/api/admin/payments");
      const details = await Promise.all(
        list.payments.map((payment) =>
          readJson<{ success: true } & AdminPaymentDetail>(
            `/api/admin/payments/${encodeURIComponent(payment.id)}`,
          ),
        ),
      );
      setPayments(sortPendingFirst(details));
      setAuthorized(true);
    } catch (caught: unknown) {
      const message = caught instanceof Error ? caught.message : "Could not load admin payments.";
      setError(message);
      if (/authorization|required|invalid/i.test(message)) {
        setAuthorized(false);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPayments();
  }, []);

  async function signIn() {
    setLoading(true);
    setError("");
    try {
      await readJson("/api/admin/session", {
        method: "POST",
        body: JSON.stringify({ secret }),
      });
      setSecret("");
      await loadPayments();
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Could not sign in.");
      setLoading(false);
    }
  }

  async function signOut() {
    await fetch("/api/admin/session", { method: "DELETE" });
    setAuthorized(false);
    setPayments([]);
  }

  async function approvePayment(id: string) {
    setLoading(true);
    setError("");
    try {
      await readJson(`/api/admin/payments/${encodeURIComponent(id)}/approve`, {
        method: "POST",
      });
      await loadPayments();
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Could not approve payment.");
      setLoading(false);
    }
  }

  async function rejectPayment(id: string) {
    setLoading(true);
    setError("");
    try {
      await readJson(`/api/admin/payments/${encodeURIComponent(id)}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason: rejectReason }),
      });
      setRejectingId(null);
      setRejectReason("");
      await loadPayments();
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Could not reject payment.");
      setLoading(false);
    }
  }

  async function viewProof(id: string) {
    setError("");
    try {
      const result = await readJson<{ success: true; url: string }>(
        `/api/admin/payments/${encodeURIComponent(id)}/proof`,
      );
      window.open(result.url, "_blank", "noopener,noreferrer");
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Could not open proof.");
    }
  }

  if (!authorized) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader
          eyebrow="Admin"
          title="Admin Payments"
          description="Enter the billing admin secret to review pending manual payments."
        />
        <Card>
          {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}
          <label className="block text-sm">
            <span className="text-muted">Admin secret</span>
            <input
              type="password"
              value={secret}
              onChange={(event) => setSecret(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-ink"
            />
          </label>
          <Button className="mt-4" disabled={loading || !secret.trim()} onClick={() => void signIn()}>
            {loading ? "Checking…" : "Open admin payments"}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Admin"
        title="Admin Payments"
        description="Pending payments appear first. Approving upgrades the user to Pro on the server."
        actions={
          <Button variant="secondary" onClick={() => void signOut()}>
            Sign out
          </Button>
        }
      />

      {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}
      {loading ? <p className="text-sm text-muted">Loading admin payments…</p> : null}

      <div className="space-y-4">
        {payments.map(({ payment, user, hasProof }) => (
          <Card key={payment.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] tracking-wide text-muted uppercase">
                  Payment ID
                </p>
                <p className="mt-1 font-mono text-[11px] text-ink">{payment.id}</p>
              </div>
              <Badge tone={payment.status === "successful" ? "gold" : "muted"}>
                {payment.status.toUpperCase()}
              </Badge>
            </div>

            <div className="mt-4 grid gap-3 text-sm text-muted md:grid-cols-2">
              <p>User: {user.fullName || user.id}</p>
              <p>Email: {user.email || "Not available"}</p>
              <p>Provider: {payment.provider}</p>
              <p>Amount: {payment.currency} {payment.amount}</p>
              <p>Transaction/reference ID: {payment.providerTransactionId || "Not submitted"}</p>
              <p>Created: {new Date(payment.createdAt).toLocaleString()}</p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                variant="secondary"
                disabled={!hasProof}
                onClick={() => void viewProof(payment.id)}
              >
                View Proof
              </Button>
              <Button
                disabled={payment.status !== "pending" || loading}
                onClick={() => void approvePayment(payment.id)}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                disabled={payment.status !== "pending" || loading}
                onClick={() => setRejectingId(payment.id)}
              >
                Reject
              </Button>
            </div>

            {rejectingId === payment.id ? (
              <div className="mt-4 space-y-3">
                <label className="block text-sm">
                  <span className="text-muted">Optional rejection reason</span>
                  <input
                    value={rejectReason}
                    onChange={(event) => setRejectReason(event.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-ink"
                  />
                </label>
                <div className="flex gap-3">
                  <Button variant="danger" onClick={() => void rejectPayment(payment.id)}>
                    Confirm reject
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setRejectingId(null);
                      setRejectReason("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
