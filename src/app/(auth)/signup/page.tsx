import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata = {
  title: "Create account — Aro",
};

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Create your space"
      title="Join Aro"
      description="Your profile, coding progress, and roadmap stay attached to you — not to this device."
      footer={
        <>
          By creating an account you agree to use Aro for your own learning.{" "}
          <Link href="/" className="text-ink">
            Back home
          </Link>
          .
        </>
      }
    >
      <Suspense fallback={<p className="text-sm text-muted">Loading form…</p>}>
        <SignupForm />
      </Suspense>
    </AuthShell>
  );
}
