"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";

export function AuthCta({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { status, user } = useAuth();

  if (status === "loading") {
    return (
      <Button size={size} className={className} disabled>
        Loading…
      </Button>
    );
  }

  if (user) {
    return (
      <Button href="/dashboard" size={size} className={className}>
        Continue learning
      </Button>
    );
  }

  return (
    <Button href="/signup" size={size} className={className}>
      Start Learning
    </Button>
  );
}
