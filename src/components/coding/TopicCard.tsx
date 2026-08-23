import Link from "next/link";
import type { CodingTopic } from "@/data/coding/types";
import { Badge, difficultyTone } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressIndicator } from "@/components/coding/ProgressIndicator";

export function TopicCard({
  href,
  topic,
  completed,
}: {
  href: string;
  topic: CodingTopic;
  completed: number;
}) {
  const total = topic.problems.length;

  return (
    <Link href={href} className="block min-w-0">
      <Card hover className="h-full">
        <div className="flex items-start justify-between gap-3">
          <h2 className="display text-base font-semibold">{topic.title}</h2>
          <Badge tone={difficultyTone(topic.difficulty)}>{topic.difficulty}</Badge>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted">{topic.description}</p>
        <p className="mt-3 text-xs text-muted">{total} Problems</p>
        <div className="mt-3">
          <ProgressIndicator completed={completed} total={total} />
        </div>
      </Card>
    </Link>
  );
}
