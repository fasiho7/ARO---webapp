import { Logo } from "@/components/layout/Logo";

export function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
      <Logo />
      <p className="font-mono text-xs text-muted">Checking your session…</p>
    </div>
  );
}
