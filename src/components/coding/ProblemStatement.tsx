import type { CodingExample, CodingProblem } from "@/data/coding/types";
import { ProblemHeader } from "@/components/coding/ProblemHeader";
import { HintSection } from "@/components/coding/HintSection";
import { parseIoFormat, realExamples } from "@/lib/codingUi";

function CodeBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <pre className="mt-1 overflow-x-auto whitespace-pre-wrap rounded-lg border border-line bg-void p-3 font-mono text-[13px] leading-6 text-[#c9cce0] [data-theme=light]:text-ink">
        {value}
      </pre>
    </div>
  );
}

export function ProblemStatement({
  problem,
  topicTitle,
  sampleCases,
  solved = false,
}: {
  problem: CodingProblem;
  topicTitle: string;
  sampleCases: CodingExample[];
  solved?: boolean;
}) {
  const statement = (problem.description || problem.summary).trim();
  const authoredExamples = realExamples(problem.examples);
  const samples = realExamples(sampleCases);
  const examples = authoredExamples.length > 0 ? authoredExamples : samples;
  const io = parseIoFormat(problem.ioFormat);
  const constraints = problem.constraints.filter((item) => item.trim().length > 0);
  const explanations = examples.filter((item) => item.explanation?.trim());

  return (
    <article className="min-w-0 rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <ProblemHeader
        problem={problem}
        topicTitle={topicTitle}
        solved={solved}
      />

      {statement ? (
        <section className="mt-5">
          <h2 className="display text-sm font-semibold">Problem Statement</h2>
          <p className="mt-2 text-sm leading-7 text-muted whitespace-pre-wrap">
            {statement}
          </p>
        </section>
      ) : null}

      {examples.length > 0 ? (
        <section className="mt-7">
          <h2 className="display text-sm font-semibold">Examples</h2>
          <div className="mt-3 space-y-3">
            {examples.map((example, index) => (
              <div
                key={`example-${index}-${example.input}`}
                className="rounded-xl border border-line bg-void p-3"
              >
                <p className="text-xs font-medium text-muted">
                  Example {index + 1}
                </p>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <CodeBlock label="Input" value={example.input} />
                  <CodeBlock label="Output" value={example.output} />
                </div>
                {example.explanation ? (
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {example.explanation}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {explanations.length > 0 && examples.some((item) => !item.explanation) ? (
        <section className="mt-7">
          <h2 className="display text-sm font-semibold">Explanation</h2>
          <ul className="mt-2 space-y-2 text-sm leading-7 text-muted">
            {explanations.map((item, index) => (
              <li key={`exp-${index}`}>{item.explanation}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {io && io.input.length > 0 ? (
        <section className="mt-7">
          <h2 className="display text-sm font-semibold">Input Format</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-7 text-muted">
            {io.input.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {io && io.output.length > 0 ? (
        <section className="mt-7">
          <h2 className="display text-sm font-semibold">Output Format</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-7 text-muted">
            {io.output.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {constraints.length > 0 ? (
        <section className="mt-7">
          <h2 className="display text-sm font-semibold">Constraints</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-7 text-muted">
            {constraints.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <HintSection hints={problem.hints} />
    </article>
  );
}
