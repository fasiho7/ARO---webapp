import {
  BookOpen,
  ClipboardList,
  Home,
  LayoutDashboard,
  Map,
  CreditCard,
  Sparkles,
  User,
  Activity,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const primaryNav: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/roadmaps", label: "Roadmaps", icon: Map },
  { href: "/ai-tutor", label: "AI Tutor", icon: Sparkles },
  { href: "/coding", label: "Coding Practice", icon: BookOpen },
  { href: "/quiz", label: "Quiz", icon: ClipboardList },
  { href: "/progress", label: "Progress", icon: Activity },
];

export const accountNav: NavItem[] = [
  { href: "/payments", label: "My Payments", icon: CreditCard },
  { href: "/profile", label: "Profile", icon: User },
];

export const mobileNav: NavItem[] = primaryNav;

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  if (href === "/dashboard") {
    return pathname === href;
  }
  if (href === "/ai-tutor") {
    return (
      pathname === "/ai-tutor" ||
      pathname.startsWith("/ai-tutor/") ||
      pathname === "/tutor" ||
      pathname.startsWith("/tutor/")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
