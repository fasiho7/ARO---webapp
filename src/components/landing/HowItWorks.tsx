const steps = [
  {
    marker: "01",
    title: "Choose your career",
    body: "Pick a track — software engineering, frontend, data, AI — sized to where you are now, not a generic syllabus.",
  },
  {
    marker: "02",
    title: "Follow your roadmap",
    body: "Every skill sits in order. You always know the next step, and finished nodes stay checked off.",
  },
  {
    marker: "03",
    title: "Learn with AI",
    body: "Ask Aro to explain a concept in plain language before you ever write the code.",
  },
  {
    marker: "04",
    title: "Practice coding",
    body: "Solve problems that match what you just learned, so the idea is used while it is still fresh.",
  },
  {
    marker: "05",
    title: "Track your progress",
    body: "Streaks, hours, and awards make the work visible — to you, and later, to whoever is hiring.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-[1180px]">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal/25 bg-teal/10 px-3.5 py-1.5 font-mono text-[12.5px] text-teal">
          How Aro works
        </p>
        <h2 className="display max-w-xl text-3xl font-semibold sm:text-[42px] sm:leading-tight">
          Five steps, repeated — not a syllabus you scroll past.
        </h2>
        <ol className="mt-12">
          {steps.map((step) => (
            <li
              key={step.marker}
              className="grid gap-2 border-t border-line py-8 last:border-b sm:grid-cols-[80px_1fr] sm:gap-6"
            >
              <span className="pt-1 font-mono text-[13px] text-teal">
                {step.marker}
              </span>
              <div>
                <h3 className="display text-lg font-semibold sm:text-[19px]">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
