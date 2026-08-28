"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { accountNav, isNavActive, primaryNav } from "@/components/layout/nav";
import { useAuth } from "@/components/providers/AuthProvider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  initialsFromName,
  profileDisplayName,
} from "@/lib/auth/display";
import { cn } from "@/lib/cn";

function coordFor(pathname: string): string {
  if (pathname.startsWith("/roadmaps/")) {
    return "ON THE TRAIL · NEXT STOP MARKED IN GOLD";
  }
  if (pathname.startsWith("/roadmaps")) {
    return "CHOOSE A CAREER · WALK THE TRAIL";
  }
  if (pathname.startsWith("/coding")) {
    return "PRACTICE GROUND · PF · OOP · DSA";
  }
  if (pathname.startsWith("/quiz")) {
    return "CHECK YOUR UNDERSTANDING · TIMED ASSESSMENT";
  }
  if (pathname.startsWith("/ai-tutor") || pathname.startsWith("/tutor")) {
    return "FIELD NOTES FROM THE TUTOR";
  }
  if (pathname.startsWith("/progress")) {
    return "WHERE YOU STAND ON THE TRAIL";
  }
  if (pathname.startsWith("/dashboard")) {
    return "YOUR LEARNING DASHBOARD";
  }
  if (pathname.startsWith("/upgrade")) {
    return "ARO PRO — COMING SOON · TEST CHECKOUT ONLY";
  }
  if (pathname === "/") {
    return "ARO · CLEAR PATHS FOR CS STUDENTS";
  }
  return "";
}

export function AppHeader() {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const name = profileDisplayName(profile, user);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);

  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
    setAccountOpen(false);
  }

  const coord = coordFor(pathname);
  const visiblePrimaryNav = pathname.startsWith("/quiz/")
    ? primaryNav.filter((item) => item.href !== "/ai-tutor")
    : primaryNav;

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-void from-60% to-transparent py-[18px] sm:py-[22px]">
      <div className="wrap">
        <nav className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="shrink-0 rounded-[2px] transition duration-200 hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <Logo />
          </Link>

          <div className="hidden items-center gap-5 lg:flex xl:gap-7">
            {visiblePrimaryNav.map((item) => {
              const active = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-[13px] font-medium transition",
                    active ? "text-ink" : "text-muted hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/profile"
              className={cn(
                "text-[13px] font-medium transition",
                isNavActive(pathname, "/profile")
                  ? "text-ink"
                  : "text-muted hover:text-ink",
              )}
            >
              Profile
            </Link>
          </div>

          {coord ? (
            <span className="coord hidden xl:block">{coord}</span>
          ) : null}

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setAccountOpen((value) => !value)}
                className="flex size-8 items-center justify-center rounded-[2px] border border-gold font-mono text-[10px] text-gold"
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                aria-label="Account menu"
              >
                {initialsFromName(name)}
              </button>
              {accountOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-44 rounded-[2px] border border-line bg-surface py-2"
                >
                  <Link
                    href="/profile"
                    role="menuitem"
                    onClick={() => setAccountOpen(false)}
                    className="block px-4 py-2 text-sm text-ink hover:bg-ink/[0.03]"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    role="menuitem"
                    onClick={() => setAccountOpen(false)}
                    className="block px-4 py-2 text-sm text-ink hover:bg-ink/[0.03]"
                  >
                    Settings
                  </Link>
                  {profile?.plan !== "pro" ? (
                    <Link
                      href="/upgrade"
                      role="menuitem"
                      onClick={() => setAccountOpen(false)}
                      className="block px-4 py-2 text-sm text-gold hover:bg-ink/[0.03]"
                    >
                      Aro Pro — Coming Soon
                    </Link>
                  ) : null}
                  {user ? (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setAccountOpen(false);
                        void signOut();
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-muted hover:text-ink"
                    >
                      Log out
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      role="menuitem"
                      onClick={() => setAccountOpen(false)}
                      className="block px-4 py-2 font-mono text-sm text-gold"
                    >
                      Sign in
                    </Link>
                  )}
                </div>
              ) : null}
            </div>
            <button
              type="button"
              className="rounded-[2px] p-2 text-ink lg:hidden"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>

        {menuOpen ? (
          <div className="mt-3 space-y-1 rounded-[2px] border border-line bg-surface p-3 lg:hidden">
            {visiblePrimaryNav.map((item) => {
              const active = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "block rounded-[2px] px-3 py-2.5 text-sm font-medium transition",
                    active
                      ? "bg-gold/10 text-gold"
                      : "text-muted hover:bg-ink/[0.03] hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            {accountNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "block rounded-[2px] px-3 py-2.5 text-sm font-medium transition",
                  isNavActive(pathname, item.href)
                    ? "bg-gold/10 text-gold"
                    : "text-muted hover:bg-ink/[0.03] hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            ))}
            {profile?.plan !== "pro" ? (
              <Link
                href="/upgrade"
                onClick={() => setMenuOpen(false)}
                className="block rounded-[2px] px-3 py-2.5 text-sm font-medium text-gold hover:bg-ink/[0.03]"
              >
                Aro Pro — Coming Soon
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
