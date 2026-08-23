import { ProgressBar } from "@/components/ui/ProgressBar";

export function ProgressIndicator({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
        <span>
          {completed}/{total} Solved
        </span>
        <span>{percent}%</span>
      </div>
      <ProgressBar value={percent} />
    </div>
  );
}
