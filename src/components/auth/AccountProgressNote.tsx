"use client";

import { useAuth } from "@/components/providers/AuthProvider";

export function AccountProgressNote({
  completed,
}: {
  completed?: boolean;
}) {
  const { user } = useAuth();

  if (user) {
    return completed
      ? "Saved to your Aro account."
      : "An accepted submission saves progress to your account.";
  }

  return completed
    ? "Saved on this device. Sign in to keep it on your profile."
    : "Sign in so accepted submissions stay on your profile.";
}
