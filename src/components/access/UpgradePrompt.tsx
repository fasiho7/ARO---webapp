import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function UpgradePrompt({
  title = "Pro required",
  description,
}: {
  title?: string;
  description: string;
}) {
  return (
    <Card>
      <p className="font-mono text-[11px] tracking-wide text-gold uppercase">
        Aro Pro — Coming Soon
      </p>
      <h2 className="display mt-2 text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      <p className="mt-2 text-sm leading-6 text-muted">
        Aro Pro — Coming Soon. Live payments are not connected. The upgrade
        page keeps a development checkout for testing only.
      </p>
      <Button href="/upgrade" variant="secondary" className="mt-5">
        View Pro
      </Button>
    </Card>
  );
}
