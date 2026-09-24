"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { UpgradePrompt } from "@/components/access/UpgradePrompt";
import { usePlan } from "@/components/access/usePlan";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ACCESS_COPY, canAccessAiTutor } from "@/lib/access";

export function AiTutorAccess() {
  const { user, loading: authLoading } = useAuth();
  const { plan, loading: planLoading } = usePlan();

  if (authLoading || (user && planLoading)) {
    return (
      <p className="font-mono text-sm text-muted">Loading AI Tutor…</p>
    );
  }

  // Temporary Coming Soon for AI Tutor
  // Keep sign-in and Pro gating messages, but show Coming Soon to authorized users
  if (!user) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader
          eyebrow="AI Tutor"
          title="Your Personal Coding Tutor"
          description="Get step-by-step help with programming concepts, debugging, and problem-solving."
        />
        <Card>
          <p className="font-mono text-[11px] tracking-wide text-gold uppercase">
            Sign in required
          </p>
          <h2 className="display mt-2 text-2xl">Sign in to use AI Tutor</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Conversations are saved to your account. Pro includes unlimited AI Tutor access.
          </p>
          <Button href="/sign-in?next=/ai-tutor" className="mt-4">
            Sign in to Aro
          </Button>
        </Card>
      </div>
    );
  }

  if (!canAccessAiTutor(plan)) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <PageHeader
          eyebrow="AI Tutor"
          title="Your Personal Coding Tutor"
          description="Pro unlocks the AI Tutor for hints, explanations, and debugging help."
        />
        <UpgradePrompt title="AI Tutor" description={ACCESS_COPY.aiTutor} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        eyebrow="AI Tutor"
        title="AI Tutor"
        description="Your personal programming tutor."
      />
      <Card className="text-center py-12">
        <h2 className="display text-3xl mb-3">Coming Soon</h2>
        <p className="text-muted">
          The AI Tutor feature is currently in development. We’re building a safe, Pro-only workspace for step-by-step coding help, hints, and debugging. Check back soon.
        </p>
        <div className="mt-6">
          <Button href="/quiz" variant="secondary">Practice Coding Quizzes</Button>
        </div>
      </Card>
    </div>
  );
}
