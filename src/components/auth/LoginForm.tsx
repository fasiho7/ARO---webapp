"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Field } from "@/components/auth/Field";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { safeNextPath } from "@/lib/auth/routes";
import { validateLogin } from "@/lib/auth/validation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, configured } = useAuth();
  const next = safeNextPath(searchParams.get("next"));
  const confirmError = searchParams.get("error") === "confirm";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState(
    confirmError
      ? "That confirmation link is invalid or expired. Sign in if you already confirmed, or sign up again."
      : "",
  );
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validateLogin({ email, password });
    setFieldErrors(errors);
    setFormError("");
    if (Object.keys(errors).length > 0) {
      return;
    }

    setPending(true);
    const { error } = await signIn(email, password);
    setPending(false);
    if (error) {
      setFormError(error);
      return;
    }
    router.replace(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {!configured ? (
        <p className="rounded-xl border border-gold/30 bg-gold/10 px-3 py-3 text-sm text-gold">
          Add your Supabase URL and anon key to <code>.env.local</code> before
          signing in.
        </p>
      ) : null}
      {formError ? (
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-3 text-sm text-danger">
          {formError}
        </p>
      ) : null}
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
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={fieldErrors.password}
        placeholder="Your password"
      />
      <Button type="submit" className="w-full" disabled={pending || !configured} size="lg">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-xs text-muted">
        New here?{" "}
        <Link href={`/signup?next=${encodeURIComponent(next)}`} className="text-teal">
          Create an Aro account
        </Link>
      </p>
    </form>
  );
}
