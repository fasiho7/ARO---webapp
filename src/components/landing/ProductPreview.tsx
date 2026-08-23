import type { ReactNode } from "react";

export function ProductPreview() {
  return (
    <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_30px_80px_-30px_rgb(0_0_0/0.7)]">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-2 font-mono text-xs text-muted">
            dashboard / software-engineer / two-sum
          </span>
        </div>
        <div className="grid lg:grid-cols-2">
          <pre className="overflow-x-auto border-b border-line p-6 font-mono text-[13px] leading-[1.9] text-[#c9cce0] lg:border-r lg:border-b-0">
            <code>
              <span className="text-muted"># two-sum, week 3</span>
              {"\n"}
              <span className="text-purple">def</span>{" "}
              <span className="text-blue">two_sum</span>(nums, target):
              {"\n"}
              {"  "}seen = {"{}"}
              {"\n"}
              {"  "}
              <span className="text-purple">for</span> i, n{" "}
              <span className="text-purple">in</span> enumerate(nums):
              {"\n"}
              {"    "}need = target - n
              {"\n"}
              {"    "}
              <span className="text-purple">if</span> need{" "}
              <span className="text-purple">in</span> seen:
              {"\n"}
              {"      "}
              <span className="text-purple">return</span> [seen[need], i]
              {"\n"}
              {"    "}seen[n] = i
            </code>
          </pre>
          <div className="flex flex-col gap-3.5 p-6">
            <PreviewMsg
              from="aro"
              text="Nice — that's O(n). Ready to continue your Software Engineer roadmap?"
            />
            <PreviewMsg from="user" text="yes, what's next?" />
            <PreviewMsg
              from="aro"
              text={
                <>
                  Next step:{" "}
                  <b className="text-teal">Data Structures</b> · 12 of 32
                  complete
                </>
              }
            />
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[38%] rounded-full grad-bg" />
            </div>
            <p className="font-mono text-[11px] text-muted">Roadmap progress 38%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewMsg({
  from,
  text,
}: {
  from: "aro" | "user";
  text: ReactNode;
}) {
  const reverse = from === "user";
  return (
    <div className={`flex gap-2.5 ${reverse ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex size-6 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold ${
          from === "aro"
            ? "grad-bg text-white"
            : "border border-line bg-surface-2 text-muted"
        }`}
      >
        {from === "aro" ? "A" : "AK"}
      </div>
      <div className="rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-[13.5px] leading-snug text-[#c9cce0] [data-theme=light]:text-ink">
        {text}
      </div>
    </div>
  );
}
