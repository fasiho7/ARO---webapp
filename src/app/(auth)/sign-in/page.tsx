import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Sign in — Aro",
};

export default function SignInPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to Aro"
      description="Pick up your coding progress, roadmap, and profile from any browser."
      footer={
        <>
          Prefer to look around first?{" "}
          <Link href="/" className="text-ink">
            Back to the homepage
          </Link>
          .
        </>
      }
    >
      <Suspense fallback={<p className="text-sm text-muted">Loading form…</p>}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
