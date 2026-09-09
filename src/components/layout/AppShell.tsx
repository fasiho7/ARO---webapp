"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AuthLoadingScreen } from "@/components/auth/AuthLoadingScreen";
import { AppHeader } from "@/components/layout/AppHeader";
import { DevPlanSwitcher } from "@/components/ui/DevPlanSwitcher";
import { isNavActive, mobileNav } from "@/components/layout/nav";
import { useAuth } from "@/components/providers/AuthProvider";
import { cn } from "@/lib/cn";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status, configured } = useAuth();
  const visibleMobileNav = pathname.startsWith("/quiz/")
    ? mobileNav.filter((item) => item.href !== "/ai-tutor")
    : mobileNav;

  useEffect(() => {
    if (!configured) {
      return;
    }
    if (status === "unauthenticated") {
      router.replace(`/sign-in?next=${encodeURIComponent(pathname)}`);
    }

  }, [configured, pathname, router, status]);

  if (configured && (status === "loading" || status === "unauthenticated")) {
    return <AuthLoadingScreen />;
  }

  return (
    <div className="flex min-h-screen w-full max-w-none flex-col">
      <AppHeader />
      <main className="wrap w-full max-w-none flex-1 pt-2 pb-20">
        <DevPlanSwitcher />
        {children}
      </main>
      <nav className="sticky bottom-0 z-30 flex gap-1 overflow-x-auto border-t border-line bg-void/90 px-2 py-2 md:hidden">
        {visibleMobileNav.map((item) => {
          const Icon = item.icon;
          const active = isNavActive(pathname, item.href);
          const label =
            item.label === "Coding Practice"
              ? "Practice"
              : item.label === "Home"
                ? "Home"
                : item.label.replace("AI ", "");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-[4.5rem] flex-1 flex-col items-center gap-1 py-1 font-mono text-[8px] tracking-[0.04em] uppercase sm:min-w-[5rem] sm:text-[9px]",
                active ? "text-gold" : "text-muted",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
