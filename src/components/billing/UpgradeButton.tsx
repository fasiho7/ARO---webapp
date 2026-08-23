import { Button } from "@/components/ui/Button";

export function UpgradeButton({
  className,
  variant = "primary",
}: {
  className?: string;
  variant?: "primary" | "secondary";
}) {
  return (
    <Button href="/upgrade" variant={variant} className={className}>
      Aro Pro — Coming Soon
    </Button>
  );
}
