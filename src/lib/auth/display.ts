import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/auth/types";

export function suggestUsername(fullName: string, userId: string): string {
  const base =
    fullName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 18) || "learner";
  const suffix = userId.replaceAll("-", "").slice(0, 6);
  return `${base}${suffix}`;
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  const last = parts[parts.length - 1];
  if (!first) {
    return "A";
  }
  if (!last || parts.length === 1) {
    return first.slice(0, 2).toUpperCase();
  }
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

export function profileDisplayName(profile: Profile | null, user: User | null): string {
  const fromProfile = profile?.full_name?.trim();
  if (fromProfile) {
    return fromProfile;
  }
  const fromMeta =
    typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : "";
  if (fromMeta) {
    return fromMeta;
  }
  const emailName = user?.email?.split("@")[0];
  return emailName || "Learner";
}

export function profileUsername(profile: Profile | null, user: User | null): string {
  if (profile?.username) {
    return profile.username;
  }
  if (user?.id) {
    return suggestUsername(profileDisplayName(profile, user), user.id);
  }
  return "guest";
}

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/).filter(Boolean)[0] ?? fullName;
}

/** Real given name only. Never invent from email. */
export function realFirstName(
  profile: Profile | null,
  user: User | null,
): string | null {
  const fromProfile = profile?.full_name?.trim();
  if (fromProfile) {
    return firstName(fromProfile);
  }
  const fromMeta =
    typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : "";
  if (fromMeta) {
    return firstName(fromMeta);
  }
  return null;
}
