import type { SupabaseClient, User } from "@supabase/supabase-js";
import { suggestUsername } from "@/lib/auth/display";
import type { Profile, ProfilePatch } from "@/lib/auth/types";
import { normalizePlan } from "@/lib/access";

const PROFILE_COLUMNS =
  "id, full_name, username, email, avatar_url, selected_career, plan, created_at, updated_at";

function asProfile(row: unknown): Profile | null {
  if (!row || typeof row !== "object") {
    return null;
  }
  const data = row as Profile;
  return {
    ...data,
    plan: normalizePlan(data.plan),
  };
}

export async function fetchProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    if (error.message.toLowerCase().includes("plan")) {
      const fallback = await supabase
        .from("profiles")
        .select(
          "id, full_name, username, email, avatar_url, selected_career, created_at, updated_at",
        )
        .eq("id", userId)
        .maybeSingle();
      if (fallback.error) {
        console.error("Failed to load profile", fallback.error.message);
        return null;
      }
      return asProfile(fallback.data);
    }
    console.error("Failed to load profile", error.message);
    return null;
  }
  return asProfile(data);
}

export async function ensureProfile(
  supabase: SupabaseClient,
  user: User,
): Promise<Profile | null> {
  const existing = await fetchProfile(supabase, user.id);
  if (existing) {
    return existing;
  }

  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : "";

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      full_name: fullName || "Learner",
      username: suggestUsername(fullName, user.id),
      email: user.email ?? null,
    })
    .select(PROFILE_COLUMNS)
    .single();

  if (error) {
    const code = "code" in error ? String(error.code) : "";
    if (code === "23505") {
      return fetchProfile(supabase, user.id);
    }
    console.error("Failed to create profile", error.message);
    return fetchProfile(supabase, user.id);
  }
  return asProfile(data);
}

export async function saveProfilePatch(
  supabase: SupabaseClient,
  userId: string,
  patch: ProfilePatch,
): Promise<{ profile: Profile | null; error: string | null }> {
  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", userId)
    .select(PROFILE_COLUMNS)
    .single();

  if (error) {
    const code = "code" in error ? String(error.code) : "";
    const message = error.message.toLowerCase();
    if (code === "23505" || message.includes("duplicate") || message.includes("unique")) {
      return { profile: null, error: "That username is already taken." };
    }
    return { profile: null, error: error.message };
  }
  return { profile: asProfile(data), error: null };
}
