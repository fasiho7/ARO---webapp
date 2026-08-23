"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { AuthCta } from "@/components/auth/AuthCta";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { useAuth } from "@/components/providers/AuthProvider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function MarketingHeader() {
  const [open, setOpen] = useState(false);
  const { user, status } = useAuth();
  const signedIn = status === "authenticated" || Boolean(user);
  const links = [
    { href: "#features", label: "Features" },
    { href: "/roadmaps", label: "Roadmaps" },
    { href: "#how-it-works", label: "How Aro works" },
    { href: signedIn ? "/dashboard" : "/signup", label: "Start" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-void from-60% to-transparent py-[26px]">
      <nav className="wrap flex items-center justify-between gap-4">
        <Link href="/" className="relative z-10">
          <Logo />
        </Link>
        <span className="coord hidden md:block">ARO · CLEAR PATHS FOR CS STUDENTS</span>
        <div className="hidden items-center gap-4 md:flex">
          {links.map((link) =>
            link.href.startsWith("/") ? (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] font-medium text-muted transition hover:text-ink"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="text-[13px] font-medium text-muted transition hover:text-ink"
              >
                {link.label}
              </a>
            ),
          )}
          <ThemeToggle />
          {!signedIn ? (
            <Button href="/login" variant="ghost" size="sm">
              Sign in
            </Button>
          ) : null}
          <AuthCta size="sm" />
        </div>
        <button
          type="button"
          className="rounded-lg p-2 text-ink md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>
      {open ? (
        <div className="space-y-3 border-t border-line px-5 py-4 md:hidden">
          {links.map((link) =>
            link.href.startsWith("/") ? (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block py-1 text-sm font-medium text-muted"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block py-1 text-sm font-medium text-muted"
              >
                {link.label}
              </a>
            ),
          )}
          {!signedIn ? (
            <Button href="/login" variant="secondary" className="w-full">
              Sign in
            </Button>
          ) : null}
          <AuthCta className="w-full" />
        </div>
      ) : null}
    </header>
  );
}
