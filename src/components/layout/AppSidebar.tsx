"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import {
  accountNav,
  isNavActive,
  primaryNav,
  type NavItem,
} from "@/components/layout/nav";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  initialsFromName,
  profileDisplayName,
  profileUsername,
} from "@/lib/auth/display";
import { cn } from "@/lib/cn";

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = isNavActive(pathname, item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      scroll
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
        active
          ? "bg-white/8 text-ink [data-theme=light]:bg-black/6"
          : "text-muted hover:bg-white/5 hover:text-ink [data-theme=light]:hover:bg-black/5",
      )}
    >
      <Icon className={cn("size-4", active && "text-teal")} />
      {item.label}
    </Link>
  );
}

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const name = profileDisplayName(profile, user);
  const username = profileUsername(profile, user);

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Link href="/" onClick={onNavigate} className="inline-flex rounded-[2px] transition duration-200 hover:opacity-80">
          <Logo />
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {primaryNav.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
      <div className="mt-auto border-t border-line px-3 py-4">
        {accountNav.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
        <Link
          href="/profile"
          onClick={onNavigate}
          className="mt-3 flex items-center gap-3 rounded-xl px-3 py-2"
        >
          <span className="flex size-8 items-center justify-center rounded-lg grad-bg text-xs font-semibold text-white">
            {initialsFromName(name)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-ink">
              {name}
            </span>
            <span className="block truncate text-xs text-muted">
              @{username}
            </span>
          </span>
        </Link>
        {user ? (
          <button
            type="button"
            onClick={() => {
              onNavigate?.();
              void signOut();
            }}
            className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm text-muted transition hover:bg-white/5 hover:text-ink [data-theme=light]:hover:bg-black/5"
          >
            Log out
          </button>
        ) : (
          <Link
            href="/login"
            onClick={onNavigate}
            className="mt-1 block rounded-xl px-3 py-2 text-sm text-teal"
          >
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
}
