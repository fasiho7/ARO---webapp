import { bearerAuthHeaders } from "@/lib/apiAuth";
import { publicEnv } from "@/lib/env";

export type PaymentStatus =
  | "pending"
  | "successful"
  | "failed"
  | "cancelled";

export type PaymentProviderId =
  | "mock"
  | "easypaisa"
  | "jazzcash"
  | "card"
  | "bank";

export type BillingMethod = {
  id: PaymentProviderId;
  label: string;
  description: string;
  available: boolean;
  live: boolean;
  instructions?: BankInstructions | null;
};

export type BillingProduct = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  interval: "month";
};

export type BankInstructions = {
  accountName?: string;
  bankName?: string;
  accountTitle?: string;
  accountNumber?: string;
  iban?: string;
};

export type PaymentCheckout = {
  type?: string | null;
  live?: boolean;
  env?: string | null;
  message?: string | null;
  launchPath?: string | null;
  returnTo?: string | null;
  instructions?: BankInstructions | null;
};

export type PaymentRecord = {
  id: string;
  userId: string;
  product: string;
  amount: number;
  currency: string;
  provider: PaymentProviderId;
  status: PaymentStatus;
  providerReference: string | null;
  providerTransactionId: string | null;
  failureReason: string | null;
  checkout: PaymentCheckout | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  completedAt: string | null;
};

export type PaymentProof = {
  success: true;
  url: string;
  expiresIn: number;
  mimeType: string | null;
  size: number | null;
  uploadedAt: string | null;
};

export type BillingCatalog = {
  success: true;
  livePayments: boolean;
  paymentEnv: "sandbox" | "production";
  product: BillingProduct;
  methods: BillingMethod[];
};

export class BillingApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "BillingApiError";
    this.status = status;
    this.code = code;
  }
}

function apiBase(): string {
  return publicEnv.apiUrl.replace(/\/$/, "");
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBase()}${path}`, {
      credentials: "include",
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(await bearerAuthHeaders()),
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new BillingApiError(
      "Billing service is temporarily unavailable.",
      0,
    );
  }

  let payload: { success?: boolean; message?: string; code?: string } = {};
  try {
    payload = (await response.json()) as typeof payload;
  } catch {
    throw new BillingApiError(
      "Billing service is temporarily unavailable.",
      response.status,
    );
  }

  if (!response.ok || payload.success === false) {
    throw new BillingApiError(
      typeof payload.message === "string" && payload.message.length > 0
        ? payload.message
        : "Billing request failed.",
      response.status,
      typeof payload.code === "string" ? payload.code : undefined,
    );
  }

  return payload as T;
}

export function fetchBillingCatalog(): Promise<BillingCatalog> {
  return requestJson<BillingCatalog>("/api/billing/catalog");
}

export function createBillingOrder(provider: PaymentProviderId): Promise<{
  success: true;
  payment: PaymentRecord;
}> {
  return requestJson("/api/billing/orders", {
    method: "POST",
    body: JSON.stringify({ provider }),
  });
}

export function fetchBillingOrder(id: string): Promise<{
  success: true;
  payment: PaymentRecord;
}> {
  return requestJson(`/api/billing/orders/${encodeURIComponent(id)}`);
}

export function fetchBillingOrders(): Promise<{
  success: true;
  payments: PaymentRecord[];
}> {
  return requestJson("/api/billing/orders");
}

export function verifyBillingOrder(
  id: string,
  outcome?: "successful" | "failed" | "cancelled",
): Promise<{
  success: true;
  payment: PaymentRecord;
}> {
  return requestJson(`/api/billing/orders/${encodeURIComponent(id)}/verify`, {
    method: "POST",
    body: JSON.stringify(outcome ? { outcome } : {}),
  });
}

export function submitBankReference(
  id: string,
  reference: string,
): Promise<{
  success: true;
  payment: PaymentRecord;
}> {
  return requestJson(
    `/api/billing/orders/${encodeURIComponent(id)}/bank-reference`,
    {
      method: "POST",
      body: JSON.stringify({ reference }),
    },
  );
}

export async function uploadBillingProof(
  id: string,
  file: File,
): Promise<{
  success: true;
  payment: PaymentRecord;
}> {
  const form = new FormData();
  form.append("proof", file);

  let response: Response;
  try {
    response = await fetch(`${apiBase()}/api/billing/orders/${encodeURIComponent(id)}/proof`, {
      method: "POST",
      credentials: "include",
      headers: await bearerAuthHeaders(),
      body: form,
    });
  } catch {
    throw new BillingApiError("Billing service is temporarily unavailable.", 0);
  }

  let payload: { success?: boolean; message?: string; code?: string; payment?: PaymentRecord } =
    {};
  try {
    payload = (await response.json()) as typeof payload;
  } catch {
    throw new BillingApiError("Could not upload payment proof.", response.status);
  }

  if (!response.ok || payload.success === false || !payload.payment) {
    throw new BillingApiError(
      typeof payload.message === "string" && payload.message.length > 0
        ? payload.message
        : "Could not upload payment proof.",
      response.status,
      typeof payload.code === "string" ? payload.code : undefined,
    );
  }

  return payload as { success: true; payment: PaymentRecord };
}

export function fetchBillingProof(id: string): Promise<PaymentProof> {
  return requestJson(`/api/billing/orders/${encodeURIComponent(id)}/proof`);
}

export function deleteBillingProof(id: string): Promise<{
  success: true;
  paymentId: string;
}> {
  return requestJson(`/api/billing/orders/${encodeURIComponent(id)}/proof`, {
    method: "DELETE",
  });
}

export async function launchHostedCheckout(id: string): Promise<void> {
  let response: Response;
  try {
    response = await fetch(
      `${apiBase()}/api/billing/orders/${encodeURIComponent(id)}/launch`,
      {
        method: "POST",
        credentials: "include",
        headers: await bearerAuthHeaders(),
      },
    );
  } catch {
    throw new BillingApiError("Could not open the payment provider.", 0);
  }
  const html = await response.text();
  if (!response.ok) {
    throw new BillingApiError("Could not open the payment provider.", response.status);
  }
  document.open();
  document.write(html);
  document.close();
}
