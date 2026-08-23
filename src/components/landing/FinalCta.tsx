import { AuthCta } from "@/components/auth/AuthCta";
import { Button } from "@/components/ui/Button";

export function FinalCta() {
  return (
    <section id="cta" className="px-5 pb-8 sm:px-8">
      <div className="mx-auto max-w-[1116px] overflow-hidden rounded-3xl border border-purple/25 bg-[linear-gradient(135deg,rgb(59_124_246/0.14),rgb(139_92_246/0.1))] px-6 py-16 text-center sm:px-12">
        <h2 className="display text-3xl font-semibold sm:text-[38px]">
          Start building your future.
        </h2>
        <p className="mt-3.5 text-muted">
          Create an account to keep coding progress and roadmap progress on
          your profile.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3.5">
          <AuthCta size="lg" />
          <Button href="/login" variant="secondary" size="lg">
            Sign in
          </Button>
        </div>
      </div>
    </section>
  );
}
