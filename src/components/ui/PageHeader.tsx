import type { ReactNode } from "react";
import { HeroTag } from "@/components/ui/Coord";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="pt-[40px] pb-10 lg:pt-[50px] lg:pb-12">
      <div className="grid items-end gap-8 lg:grid-cols-[1.3fr_0.9fr] lg:gap-[60px]">
        <div>
          {eyebrow ? <HeroTag>{eyebrow}</HeroTag> : null}
          <h1 className="display text-[clamp(38px,5.6vw,66px)] leading-[1.06] font-medium">
            {title}
          </h1>
        </div>
        {description ? (
          <div className="border-l-2 border-line pl-[22px]">
            <div className="text-[15px] leading-[1.65] text-muted">{description}</div>
          </div>
        ) : null}
      </div>
      {actions ? <div className="mt-[30px] flex flex-wrap gap-3.5">{actions}</div> : null}
    </section>
  );
}
