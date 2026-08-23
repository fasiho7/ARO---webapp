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
  const { signUp, configured } = useAuth();
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
        placeholder="Ayesha Khan"
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
      <p className="text-center text-xs text-muted">
        Already have an account?{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-teal">
          Sign in
        </Link>
      </p>
    </form>
  );
}
