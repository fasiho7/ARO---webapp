import { AuthCta } from "@/components/auth/AuthCta";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-5 pt-16 pb-10 sm:px-8 sm:pt-24 sm:pb-16">
      <div className="mx-auto max-w-[1180px]">
        <p className="mb-7 inline-flex items-center gap-2 rounded-full border border-teal/25 bg-teal/10 px-3.5 py-1.5 font-mono text-[12.5px] text-teal">
          <span className="size-1.5 rounded-full bg-teal shadow-[0_0_8px_var(--teal)]" />
          For students across Pakistan & South Asia
        </p>
        <p className="display text-sm font-semibold tracking-wide text-muted">Aro</p>
        <h1 className="display mt-3 max-w-4xl text-[40px] leading-[1.04] font-bold sm:text-6xl lg:text-[76px]">
          Learn to build software,
          <br />
          <span className="grad-text">step by step.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-7 text-muted">
          Learn with an AI tutor, follow a career roadmap, practice coding, and
          track your progress — all in one place.
        </p>
        <div className="mt-9 flex flex-wrap gap-3.5">
          <AuthCta size="lg" />
          <Button href="/roadmaps" variant="secondary" size="lg">
            Explore Roadmaps
          </Button>
        </div>
      </div>
    </section>
  );
}
