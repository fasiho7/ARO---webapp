"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export function LogoutButton({
  className,
  label = "Log out",
}: {
  className?: string;
  label?: string;
}) {
  const { signOut, status } = useAuth();

  return (
    <Button
      type="button"
      variant="danger"
      className={cn("w-full", className)}
      disabled={status !== "authenticated"}
      onClick={() => void signOut()}
    >
      {label}
    </Button>
  );
}
