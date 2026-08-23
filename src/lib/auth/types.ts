export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type UserPlan = "free" | "pro";

export type Profile = {
  id: string;
  full_name: string;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  selected_career: string | null;
  plan: UserPlan;
  created_at: string;
  updated_at: string;
};

export type ProfilePatch = Partial<
  Pick<Profile, "full_name" | "username" | "selected_career" | "avatar_url">
>;
