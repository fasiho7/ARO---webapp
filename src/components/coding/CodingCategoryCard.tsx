import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type CodingCategoryCardProps = {
  href: string;
  shortName: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: "blue" | "purple" | "teal";
};

const tones = {
  blue: "text-blue border-blue/30 bg-blue/10",
  purple: "text-purple border-purple/30 bg-purple/10",
  teal: "text-teal border-teal/30 bg-teal/10",
} as const;

export function CodingCategoryCard({
  href,
  shortName,
  title,
  description,
  icon: Icon,
  tone,
}: CodingCategoryCardProps) {
  return (
    <Link href={href} className="block min-w-0">
      <Card hover className="h-full">
        <div
          className={cn(
            "mb-4 flex size-12 items-center justify-center rounded-xl border",
            tones[tone],
          )}
        >
          <Icon className="size-5" />
        </div>
        <p className="font-mono text-xs text-teal">{shortName}</p>
        <h2 className="display mt-1 text-xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      </Card>
    </Link>
  );
}
