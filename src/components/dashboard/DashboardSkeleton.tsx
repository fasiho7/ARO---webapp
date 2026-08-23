import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

export function DashboardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("animate-pulse", className)}>
      <div className="h-3 w-24 rounded bg-white/10 [data-theme=light]:bg-black/10" />
      <div className="mt-4 h-7 w-40 rounded bg-white/10 [data-theme=light]:bg-black/10" />
      <div className="mt-3 h-3 w-full rounded bg-white/10 [data-theme=light]:bg-black/10" />
      <p className="mt-4 font-mono text-xs text-muted">Loading…</p>
    </Card>
  );
}
