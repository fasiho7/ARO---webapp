import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/layout/Logo";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="relative min-h-screen lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <aside className="relative hidden overflow-hidden border-r border-line px-10 py-10 lg:flex lg:flex-col">
        <Link href="/" className="relative z-10 w-fit">
          <Logo />
        </Link>
        <div className="relative z-10 mt-auto max-w-md pb-8">
          <p className="text-[11px] font-medium tracking-[0.18em] text-muted uppercase">
            Your CS path
          </p>
          <h2 className="display mt-4 text-4xl leading-tight">
            A quiet place to learn what comes next.
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted">
            Follow a path, practice the topic, and keep progress on your
            account — not in a shared browser cache.
          </p>
        </div>
      </aside>

      <main className="flex min-h-screen flex-col px-5 py-8 sm:px-10">
        <div className="mb-10 flex items-center justify-between lg:hidden">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <p className="text-[11px] font-medium tracking-[0.18em] text-muted uppercase">
            {eyebrow}
          </p>
          <h1 className="display mt-3 text-3xl tracking-tight">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-8 text-sm text-muted">{footer}</p>
        </div>
      </main>
    </div>
  );
}
