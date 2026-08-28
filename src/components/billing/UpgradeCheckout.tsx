"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/lib/cn";
import {
  BillingApiError,
  createBillingOrder,
  deleteBillingProof,
  fetchBillingCatalog,
  fetchBillingProof,
  submitBankReference,
  uploadBillingProof,
  type BillingCatalog,
  type PaymentProviderId,
  type PaymentRecord,
} from "@/lib/billingApi";

const PRO_INCLUDES = [
  "Beginner problems",
  "Medium problems",
  "Advanced problems",
  "Dry Run",
  "AI Tutor",
  "Full roadmap access",
];

function formatPrice(amount: number, currency: string, interval: string): string {
  return `${currency} ${amount} / ${interval}`;
}

function paymentTitle(status: PaymentRecord["status"]): string {
  if (status === "successful") return "You're now on Aro Pro";
  if (status === "failed") return "Payment failed";
  if (status === "cancelled") return "Payment cancelled";
  return "Payment pending";
}

function paymentStatusLabel(status: PaymentRecord["status"]): string {
  return status.toUpperCase();
}

export function UpgradeCheckout() {
  const { profile, status: authStatus } = useAuth();
  const [catalog, setCatalog] = useState<BillingCatalog | null>(null);
  const [catalogError, setCatalogError] = useState("");
  const [provider, setProvider] = useState<PaymentProviderId | null>(null);
  const [payment, setPayment] = useState<PaymentRecord | null>(null);
  const [reference, setReference] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofMessage, setProofMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void fetchBillingCatalog()
      .then((next) => {
        if (cancelled) return;
        setCatalog(next);
        const firstAvailable = next.methods.find(
          (method) => method.id !== "mock" && method.available,
        );
        setProvider(firstAvailable?.id ?? "easypaisa");
      })
      .catch((caught: unknown) => {
        if (cancelled) return;
        setCatalogError(
          caught instanceof BillingApiError
            ? caught.message
            : "Could not load checkout.",
        );
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleMethods = useMemo(() => {
    if (!catalog) return [];
    return catalog.methods.filter((method) => method.id !== "mock");
  }, [catalog]);

  const selectedMethod = visibleMethods.find((method) => method.id === provider) ?? null;
  const isPro = profile?.plan === "pro";
  const isManualPayment =
    payment?.provider === "bank" || payment?.provider === "easypaisa";

  async function startCheckout() {
    if (!provider) {
      setError("Choose a payment method.");
      return;
    }
    setBusy(true);
    setError("");
    setProofMessage("");
    try {
      const result = await createBillingOrder(provider);
      setPayment(result.payment);
      setReference(result.payment.providerTransactionId ?? "");
    } catch (caught: unknown) {
      setError(
        caught instanceof BillingApiError
          ? caught.message
          : "Could not create this payment.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function submitManualPayment() {
    if (!payment) return;
    if (!reference.trim()) {
      setError("Enter the transaction or reference ID.");
      return;
    }
    if (!proofFile) {
      setError("Attach your payment screenshot.");
      return;
    }
    setBusy(true);
    setError("");
    setProofMessage("");
    try {
      const referenceResult = await submitBankReference(payment.id, reference);
      const proofResult = await uploadBillingProof(payment.id, proofFile);
      setPayment(proofResult.payment);
      setReference(referenceResult.payment.providerTransactionId ?? reference.trim());
      setProofMessage(
        "Payment submitted successfully. Your payment is pending admin verification.",
      );
    } catch (caught: unknown) {
      setError(
        caught instanceof BillingApiError
          ? caught.message
          : "Could not submit this payment proof.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function viewProof() {
    if (!payment) return;
    setBusy(true);
    setError("");
    try {
      const proof = await fetchBillingProof(payment.id);
      window.open(proof.url, "_blank", "noopener,noreferrer");
    } catch (caught: unknown) {
      setError(
        caught instanceof BillingApiError ? caught.message : "Could not open the proof.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function removeProof() {
    if (!payment) return;
    setBusy(true);
    setError("");
    setProofMessage("");
    try {
      await deleteBillingProof(payment.id);
      setProofFile(null);
      setProofMessage("Proof deleted. You can upload a new screenshot.");
    } catch (caught: unknown) {
      setError(
        caught instanceof BillingApiError
          ? caught.message
          : "Could not delete the proof.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (authStatus === "loading") {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  if (isPro) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader
          eyebrow="Pro"
          title="You are on Pro"
          description="Medium and Advanced problems, Dry Run, and AI Tutor are included."
        />
        <Card>
          <p className="font-mono text-[11px] tracking-wide text-gold uppercase">Plan</p>
          <h2 className="display mt-2 text-xl font-semibold">You&apos;re now on Aro Pro</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            This account is already Pro. Nothing else is charged from this page.
          </p>
          <Button href="/dashboard" className="mt-5">
            Back to Aro
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        eyebrow="Aro Pro — Coming Soon"
        title="Aro Pro — Coming Soon"
        description="Manual payments are enabled for this MVP. Your plan stays Free until Aro verifies the transaction on the server."
      />

      {catalogError ? (
        <Card>
          <p className="text-sm text-danger">{catalogError}</p>
        </Card>
      ) : null}

      {catalog ? (
        <>
          <Card>
            <p className="font-mono text-[11px] tracking-wide text-muted uppercase">Aro Pro</p>
            <p className="display mt-2 text-3xl font-semibold">
              {formatPrice(
                catalog.product.amount,
                catalog.product.currency,
                catalog.product.interval,
              )}
            </p>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-muted">
              {PRO_INCLUDES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>

          <div className="mt-4 grid gap-3">
            {visibleMethods.map((method) => {
              const selected = provider === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  disabled={busy || Boolean(payment) || !method.available}
                  onClick={() => setProvider(method.id)}
                  className={cn(
                    "rounded-[2px] border bg-surface p-8 text-left transition duration-200",
                    selected ? "border-gold" : "border-line",
                    method.available
                      ? "hover:bg-ink/[0.02]"
                      : "cursor-not-allowed opacity-60",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="display text-base font-semibold">
                      {method.id === "jazzcash" ? "JazzCash — Coming Soon" : method.label}
                    </p>
                    <Badge tone={method.available ? "gold" : "muted"}>
                      {method.id === "jazzcash"
                        ? "Coming Soon"
                        : method.available
                          ? "Manual"
                          : "Unavailable"}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {method.id === "jazzcash"
                      ? "JazzCash manual checkout is not available in this MVP."
                      : method.description}
                  </p>
                </button>
              );
            })}
          </div>

          {!payment ? (
            <div className="mt-6">
              {selectedMethod?.id === "jazzcash" ? (
                <Card className="mb-4">
                  <p className="text-sm text-muted">JazzCash — Coming Soon</p>
                </Card>
              ) : null}
              {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}
              <Button
                type="button"
                disabled={busy || !provider || selectedMethod?.id === "jazzcash"}
                onClick={() => void startCheckout()}
              >
                {busy ? "Starting…" : "Continue"}
              </Button>
            </div>
          ) : (
            <Card className="mt-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[11px] tracking-wide text-gold uppercase">
                    {paymentStatusLabel(payment.status)}
                  </p>
                  <h2 className="display mt-2 text-xl font-semibold">
                    {paymentTitle(payment.status)}
                  </h2>
                </div>
                <Badge tone={payment.status === "successful" ? "gold" : "muted"}>
                  {paymentStatusLabel(payment.status)}
                </Badge>
              </div>

              <p className="mt-2 text-sm leading-6 text-muted">
                {catalog.product.currency} {payment.amount} · {payment.provider}
              </p>
              {payment.failureReason ? (
                <p className="mt-2 text-sm text-danger">{payment.failureReason}</p>
              ) : null}
              {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
              {proofMessage ? <p className="mt-2 text-sm text-teal">{proofMessage}</p> : null}

              {isManualPayment && payment.status === "pending" ? (
                <div className="mt-5 space-y-4">
                  {payment.provider === "easypaisa" ? (
                    <div className="space-y-2 text-sm leading-6 text-muted">
                      <p className="font-medium text-ink">Easypaisa</p>
                      <p>{payment.currency} {payment.amount}</p>
                      <p>Account Name:</p>
                      <p>{payment.checkout?.instructions?.accountName || "Not configured"}</p>
                      <p>Account Number:</p>
                      <p className="font-mono text-[11px]">
                        {payment.checkout?.instructions?.accountNumber || "Not configured"}
                      </p>
                      <p>
                        Send {payment.currency} {payment.amount} to this Easypaisa account, then
                        upload your payment screenshot.
                      </p>
                    </div>
                  ) : null}

                  {payment.provider === "bank" ? (
                    <div className="space-y-2 text-sm leading-6 text-muted">
                      <p className="font-medium text-ink">
                        {payment.checkout?.instructions?.bankName || "Bank transfer"}
                      </p>
                      {payment.checkout?.instructions?.accountName ||
                      payment.checkout?.instructions?.accountTitle ? (
                        <p>
                          Account Name:{" "}
                          {payment.checkout.instructions.accountName ||
                            payment.checkout.instructions.accountTitle}
                        </p>
                      ) : null}
                      {payment.checkout?.instructions?.accountNumber ? (
                        <p className="font-mono text-[11px]">
                          Account Number: {payment.checkout.instructions.accountNumber}
                        </p>
                      ) : null}
                      {payment.checkout?.instructions?.iban ? (
                        <p className="font-mono text-[11px]">
                          IBAN: {payment.checkout.instructions.iban}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  <label className="block text-sm">
                    <span className="text-muted">Transaction / Reference ID</span>
                    <input
                      value={reference}
                      onChange={(event) => setReference(event.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-ink"
                    />
                  </label>

                  <label className="block text-sm">
                    <span className="text-muted">Payment Screenshot</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/heic"
                      onChange={(event) => setProofFile(event.target.files?.[0] ?? null)}
                      className="mt-1.5 block w-full text-sm text-muted"
                    />
                  </label>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="button"
                      disabled={busy}
                      onClick={() => void submitManualPayment()}
                    >
                      {busy ? "Submitting…" : "Submit Payment Proof"}
                    </Button>
                    <Button type="button" variant="secondary" disabled={busy} onClick={() => void viewProof()}>
                      View Proof
                    </Button>
                    <Button type="button" variant="ghost" disabled={busy} onClick={() => void removeProof()}>
                      Delete Proof
                    </Button>
                  </div>

                  <p className="text-sm leading-6 text-muted">
                    Upload your screenshot and submit your reference. Pro stays locked until
                    admin verification is complete.
                  </p>
                </div>
              ) : null}

              {payment.status === "successful" ? (
                <Button href="/dashboard" className="mt-5">
                  Back to Aro
                </Button>
              ) : null}

              {(payment.status === "failed" || payment.status === "cancelled") && (
                <Button
                  type="button"
                  className="mt-5"
                  onClick={() => {
                    setPayment(null);
                    setReference("");
                    setProofFile(null);
                    setProofMessage("");
                    setError("");
                  }}
                >
                  Start again
                </Button>
              )}
            </Card>
          )}
        </>
      ) : !catalogError ? (
        <p className="text-sm text-muted">Loading checkout…</p>
      ) : null}
    </div>
  );
}
