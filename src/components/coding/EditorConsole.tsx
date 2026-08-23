"use client";

import { cn } from "@/lib/cn";
import { ExecutionOutput, type ExecutionView } from "@/components/coding/ExecutionOutput";

type ConsoleTab = "input" | "output";

export function EditorConsole({
  tab,
  onTabChange,
  stdin,
  onStdinChange,
  busy,
  view,
}: {
  tab: ConsoleTab;
  onTabChange: (tab: ConsoleTab) => void;
  stdin: string;
  onStdinChange: (value: string) => void;
  busy: boolean;
  view: ExecutionView;
}) {
  return (
    <div className="flex h-[220px] min-h-[180px] flex-col border-t border-[#2d2d2d] bg-[#1e1e1e]">
      <div className="flex shrink-0 gap-1 border-b border-[#2d2d2d] px-2 pt-2">
        <button
          type="button"
          onClick={() => onTabChange("input")}
          className={cn(
            "rounded-t-md px-3 py-1.5 text-xs font-medium",
            tab === "input"
              ? "bg-[#252526] text-ink"
              : "text-muted hover:text-ink",
          )}
        >
          Custom Input (stdin)
        </button>
        <button
          type="button"
          onClick={() => onTabChange("output")}
          className={cn(
            "rounded-t-md px-3 py-1.5 text-xs font-medium",
            tab === "output"
              ? "bg-[#252526] text-ink"
              : "text-muted hover:text-ink",
          )}
        >
          Output
        </button>
      </div>
      <div className="min-h-0 flex-1 bg-[#252526]">
        {tab === "input" ? (
          <textarea
            value={stdin}
            onChange={(event) => onStdinChange(event.target.value)}
            spellCheck={false}
            disabled={busy}
            className="h-full w-full resize-none bg-transparent p-3 font-mono text-[13px] leading-6 text-[#d4d4d4] outline-none disabled:opacity-70"
            aria-label="Custom input"
            placeholder="stdin for Run (not used by Submit)"
          />
        ) : (
          <ExecutionOutput view={view} embedded />
        )}
      </div>
    </div>
  );
}
