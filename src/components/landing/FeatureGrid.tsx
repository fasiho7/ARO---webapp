import Link from "next/link";
import { Brain, Code2, Map, Trophy } from "lucide-react";

const features = [
  {
    step: "01 · understand",
    title: "AI Tutor",
    description: "Get clear explanations and guidance while you learn.",
    icon: Brain,
    color: "text-blue border-blue/30 bg-blue/10",
    href: "/ai-tutor",
  },
  {
    step: "02 · place it",
    title: "Career Roadmaps",
    description: "Know what to learn next for the career you want.",
    icon: Map,
    color: "text-teal border-teal/30 bg-teal/10",
    href: "/roadmaps",
  },
  {
    step: "03 · practice",
    title: "Coding Platform",
    description:
      "Practice real programming problems and improve your problem solving.",
    icon: Code2,
    color: "text-purple border-purple/30 bg-purple/10",
    href: "/coding",
  },
  {
    step: "04 · get credit",
    title: "Progress + Awards",
    description:
      "Track your growth, maintain your streak and earn achievements.",
    icon: Trophy,
    color: "text-gold border-gold/10 bg-gold/10",
    href: "/progress",
  },
] as const;

export function FeatureGrid() {
  return (
    <section id="features" className="px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-[1180px]">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal/25 bg-teal/10 px-3.5 py-1.5 font-mono text-[12.5px] text-teal">
          Everything you need to grow
        </p>
        <h2 className="display max-w-xl text-3xl font-semibold sm:text-[42px] sm:leading-tight">
          Everything sits on one road, not four apps.
        </h2>
        <p className="mt-3.5 max-w-xl text-muted">
          Each feature hands off to the next — understand a concept, place it on
          your roadmap, practice it, and get credit for it.
        </p>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            const body = (
              <>
                <span className="mb-2.5 block font-mono text-[11px] text-muted">
                  {feature.step}
                </span>
                <div
                  className={`mb-4 flex size-12 items-center justify-center rounded-[11px] border ${feature.color}`}
                >
                  <Icon className="size-[22px]" />
                </div>
                <h3 className="display text-[17px] font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {feature.description}
                </p>
              </>
            );
            const className =
              "rounded-2xl border border-line bg-surface p-7 transition duration-200 hover:-translate-y-1.5 hover:border-white/20 [data-theme=light]:hover:border-black/15";
            return (
              <Link key={feature.title} href={feature.href} className={className}>
                {body}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
