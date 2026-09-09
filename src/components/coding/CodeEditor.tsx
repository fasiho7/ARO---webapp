"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Settings } from "lucide-react";
import { CODING_LANGUAGES, type CodingLanguage } from "@/data/coding/types";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const MonacoPane = dynamic(() => import("./MonacoPane"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[#1e1e1e] text-sm text-[#9d9d9d]">
      Loading editor...
    </div>
  ),
});

type EditorPrefs = {
  fontSize: number;
  minimap: boolean;
};

type CodeEditorProps = {
  language: CodingLanguage;
  code: string;
  busy: boolean;
  running: boolean;
  submitting: boolean;
  dryRunning?: boolean;
  examMode?: boolean;
  highlightLine?: number | null;
  onLanguageChange: (language: CodingLanguage) => void;
  onCodeChange: (code: string) => void;
  onRun: () => void;
  onSubmit: () => void;
  onDryRun?: () => void;
  onIntegrityEvent?: (eventType: string) => void;
};

export function CodeEditor({
  language,
  code,
  busy,
  running,
  submitting,
  dryRunning = false,
  examMode = false,
  highlightLine = null,
  onLanguageChange,
  onCodeChange,
  onRun,
  onSubmit,
  onDryRun,
  onIntegrityEvent,
}: CodeEditorProps) {
  const [prefs, setPrefs] = useState<EditorPrefs>({
    fontSize: 14,
    minimap: true,
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [cursor, setCursor] = useState({ line: 1, column: 1 });

  function updatePrefs(next: EditorPrefs) {
    setPrefs(next);
  }

  const lineCount = Math.max(code.split("\n").length, 1);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#1e1e1e]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2d2d2d] bg-[#252526] px-3 py-2">
        <label className="flex items-center gap-2 text-xs text-[#9d9d9d]">
          Language
          <select
            value={language}
            disabled={busy}
            onChange={(event) =>
              onLanguageChange(event.target.value as CodingLanguage)
            }
            className="rounded-md border border-[#3c3c3c] bg-[#1e1e1e] px-2 py-1 text-xs text-[#d4d4d4] disabled:opacity-40"
          >
            {CODING_LANGUAGES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={onRun}
            className="border-[#3c3c3c] bg-transparent"
          >
            {running ? "Running..." : "Run"}
          </Button>
          {onDryRun ? (
            <Button
              variant="secondary"
              size="sm"
              disabled={busy}
              onClick={onDryRun}
              className="border-[#3c3c3c] bg-transparent"
            >
              {dryRunning ? "Tracing..." : "Dry Run"}
            </Button>
          ) : null}
          <Button size="sm" disabled={busy} onClick={onSubmit}>
            {submitting ? "Submitting..." : "Submit"}
          </Button>
          <div className="relative">
            <button
              type="button"
              aria-label="Editor settings"
              onClick={() => setSettingsOpen((value) => !value)}
              className="rounded-md border border-[#3c3c3c] p-1.5 text-[#9d9d9d] hover:text-ink"
            >
              <Settings className="size-4" />
            </button>
            {settingsOpen ? (
              <div className="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-[#3c3c3c] bg-[#252526] p-3 text-xs shadow-xl">
                <p className="mb-2 font-medium text-ink">Editor</p>
                <label className="mb-2 flex items-center justify-between gap-2 text-[#9d9d9d]">
                  Font size
                  <select
                    value={prefs.fontSize}
                    onChange={(event) =>
                      updatePrefs({
                        ...prefs,
                        fontSize: Number(event.target.value),
                      })
                    }
                    className="rounded border border-[#3c3c3c] bg-[#1e1e1e] px-1 py-0.5 text-[#d4d4d4]"
                  >
                    <option value={12}>12</option>
                    <option value={14}>14</option>
                    <option value={16}>16</option>
                  </select>
                </label>
                <label className="flex items-center justify-between gap-2 text-[#9d9d9d]">
                  Minimap
                  <input
                    type="checkbox"
                    checked={prefs.minimap}
                    onChange={(event) =>
                      updatePrefs({ ...prefs, minimap: event.target.checked })
                    }
                  />
                </label>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="relative h-[320px] w-full overflow-hidden sm:h-[380px] xl:h-[460px]">
        <div className="absolute inset-0">
          <MonacoPane
            language={language}
            code={code}
            readOnly={busy}
            fontSize={prefs.fontSize}
            minimap={prefs.minimap}
            examMode={examMode}
            highlightLine={highlightLine}
            onCodeChange={onCodeChange}
            onCursorChange={(line, column) => setCursor({ line, column })}
            onIntegrityEvent={onIntegrityEvent}
          />
        </div>
      </div>

      <div
        className={cn(
          "flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[#2d2d2d] bg-[#007acc] px-3 py-1 font-mono text-[11px] text-white",
        )}
      >
        <span>
          Ln {cursor.line}, Col {cursor.column}
        </span>
        <span>Spaces: 4</span>
        <span>UTF-8</span>
        <span>LF</span>
        <span className="ml-auto">{language}</span>
        <span className="text-white/80">{lineCount} lines</span>
      </div>
    </div>
  );
}
