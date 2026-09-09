"use client";

import { BotMessageSquare, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

/**
 * AI Tutor — Coming Soon
 *
 * The feature is under development. All users (free and pro) see this
 * placeholder. When the tutor is ready, swap this file back to the
 * gated <TutorWorkspace> implementation.
 */
export function AiTutorAccess() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        eyebrow="AI Tutor"
        title="Your Personal Coding Tutor"
        description="Get instant, step-by-step help with programming concepts, debugging, and problem-solving — powered by AI."
      />

      <Card>
        <div className="flex flex-col items-center gap-5 py-10 text-center">
          {/* Icon cluster */}
          <div className="relative">
            <div className="flex size-20 items-center justify-center rounded-full border border-gold/30 bg-gold/10">
              <BotMessageSquare className="size-9 text-gold" />
            </div>
            <span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-void">
              <Sparkles className="size-3.5 text-gold" />
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <p className="font-mono text-[11px] tracking-widest text-gold uppercase">
              Coming Soon
            </p>
            <h2 className="display text-2xl sm:text-3xl">AI Tutor is on its way</h2>
          </div>

          {/* Description */}
          <p className="max-w-md text-sm leading-7 text-muted">
            We&apos;re building an AI-powered tutor that explains concepts in plain
            language, walks through your code line by line, and helps you get
            unstuck — available for all Aro learners.
          </p>

          {/* Feature preview list */}
          <ul className="mt-2 w-full max-w-sm space-y-3 text-left text-sm text-muted">
            {[
              "Ask anything about C++, Python, Java, or DSA",
              "Explain errors and suggest fixes",
              "Step-by-step concept walkthroughs",
              "Quiz prep and practice questions",
              "Works alongside Coding Practice",
            ].map((feature) => (
              <li key={feature} className="flex items-start gap-2.5">
                <span className="mt-0.5 text-gold">✦</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {/* Subtle status note */}
          <p className="mt-4 font-mono text-[11px] text-muted">
            Stay tuned — we&apos;ll notify you when it launches.
          </p>
        </div>
      </Card>
    </div>
  );
}
