"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Field } from "@/components/auth/Field";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { safeNextPath } from "@/lib/auth/routes";
import { validateLogin } from "@/lib/auth/validation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signInWithGoogle, configured, status } = useAuth();
  const next = safeNextPath(searchParams.get("next"));

  useEffect(() => {
    if (configured && status === "authenticated") {
      router.replace("/");
    }
  }, [configured, status, router]);
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
        New here?{" "}
        <Link href={`/signup?next=${encodeURIComponent(next)}`} className="text-teal">
          Create an Aro account
        </Link>
      </p>
    </form>
  );
}
