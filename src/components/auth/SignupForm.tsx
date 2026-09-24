"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Field } from "@/components/auth/Field";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { safeNextPath } from "@/lib/auth/routes";
import { validateSignup } from "@/lib/auth/validation";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, signInWithGoogle, configured } = useAuth();
  const next = safeNextPath(searchParams.get("next"));

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validateSignup({
      fullName,
      email,
      password,
      confirmPassword,
    });
    setFieldErrors(errors);
    setFormError("");
    if (Object.keys(errors).length > 0) {
      return;
    }

    setPending(true);
    const { error, needsEmailConfirm: confirm } = await signUp({
      fullName,
      email,
      password,
    });
    setPending(false);
    if (error) {
      setFormError(error);
      return;
    }
    if (confirm) {
      setNeedsEmailConfirm(true);
      return;
    }
    router.replace(next);
    router.refresh();
  }

  if (needsEmailConfirm) {
    return (
      <div className="rounded-2xl border border-teal/25 bg-teal/10 px-5 py-6">
        <p className="font-mono text-xs text-teal">Check your inbox</p>
        <h2 className="display mt-2 text-xl font-semibold">Confirm your email</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          We sent a confirmation link to <span className="text-ink">{email}</span>.
          Open it to finish creating your Aro profile, then sign in.
        </p>
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="mt-5 inline-flex text-sm font-semibold text-teal"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {!configured ? (
        <p className="rounded-xl border border-gold/30 bg-gold/10 px-3 py-3 text-sm text-gold">
          Add your Supabase URL and anon key to <code>.env.local</code> before
          creating an account.
        </p>
      ) : null}
      {formError ? (
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-3 text-sm text-danger">
          {formError}
        </p>
      ) : null}
      <Field
        label="Full name"
        name="fullName"
        autoComplete="name"
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
        error={fieldErrors.fullName}
        placeholder="Your full name"
      />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={fieldErrors.email}
        placeholder="you@example.com"
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={fieldErrors.password}
        hint="At least 8 characters, with a letter and a number."
        placeholder="Create a password"
      />
      <Field
        label="Confirm password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        error={fieldErrors.confirmPassword}
        placeholder="Repeat your password"
      />
      <Button type="submit" className="w-full" disabled={pending || !configured} size="lg">
        {pending ? "Creating account…" : "Create account"}
      </Button>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted">or</span>
        </div>
      </div>
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        disabled={!configured}
        size="lg"
        onClick={async () => {
          const { error } = await signInWithGoogle(next);
          if (error) {
            setFormError(error);
          }
        }}
      >
        <span className="inline-flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#EA4335" d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.6-5.1 3.6-3.1 0-5.6-2.5-5.6-5.6S8.9 6 12 6c1.7 0 2.8.7 3.4 1.3l2.3-2.3C16.5 3.8 14.4 3 12 3 6.9 3 3 6.9 3 12s3.9 9 9 9c5.1 0 8.4-3.5 8.4-8.7 0-.6 0-1.1-.1-1.6H12z"/>
          </svg>
          Continue with Google
        </span>
      </Button>
      <p className="text-center text-xs text-muted">
        Already have an account?{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-teal">
          Sign in
        </Link>
      </p>
    </form>
  );
}
