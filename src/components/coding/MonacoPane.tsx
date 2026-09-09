"use client";

import Editor, { loader, type OnMount } from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import { monacoLanguage } from "@/lib/codingUi";

type MonacoPaneProps = {
  language: string;
  code: string;
  readOnly: boolean;
  fontSize: number;
  minimap: boolean;
  examMode?: boolean;
  highlightLine?: number | null;
  onCodeChange: (code: string) => void;
  onCursorChange: (line: number, column: number) => void;
  onIntegrityEvent?: (eventType: string) => void;
  onEditorReady?: (editor: unknown) => void;
};

function FallbackEditor({
  language,
  code,
  readOnly,
  examMode,
  highlightLine,
  onCodeChange,
  onIntegrityEvent,
}: Pick<
  MonacoPaneProps,
  | "language"
  | "code"
  | "readOnly"
  | "examMode"
  | "highlightLine"
  | "onCodeChange"
  | "onIntegrityEvent"
>) {
  const lines = Math.max(code.split("\n").length, 1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlightLine == null || !scrollRef.current) {
      return;
    }
    const target = scrollRef.current.querySelector<HTMLElement>(
      `[data-line="${highlightLine}"]`,
    );
    if (!target) {
      return;
    }
    const container = scrollRef.current;
    const containerTop = container.scrollTop;
    const containerBottom = containerTop + container.clientHeight;
    const targetTop = target.offsetTop;
    const targetBottom = targetTop + target.offsetHeight;
    if (targetTop < containerTop || targetBottom > containerBottom) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightLine]);

  return (
    <div className="flex h-full min-h-[380px] overflow-hidden bg-[#1e1e1e]">
      <div
        aria-hidden="true"
        className="select-none border-r border-[#2d2d2d] bg-[#1e1e1e] px-2 py-3 text-right font-mono text-[12px] leading-7 text-[#858585]"
      >
        {Array.from({ length: lines }, (_, index) => (
          <div key={index}>{index + 1}</div>
        ))}
      </div>
      <div
        ref={scrollRef}
        className="min-h-[380px] min-w-0 flex-1 overflow-auto bg-[#1e1e1e]"
      >
        <div className="font-mono text-[13px] leading-7 text-[#d4d4d4]">
          {Array.from({ length: lines }, (_, index) => {
            const lineNumber = index + 1;
            const lineCode = code.split("\n")[index] ?? "";
            const active = highlightLine === lineNumber;
            return (
              <div
                key={index}
                data-line={lineNumber}
                className={
                  active
                    ? "flex items-stretch bg-teal/20 px-3"
                    : "flex items-stretch px-3"
                }
              >
                <textarea
                  value={lineCode}
                  onChange={(event) => {
                    const next = code.split("\n");
                    next[index] = event.target.value;
                    onCodeChange(next.join("\n"));
                  }}
                  onCopy={(e) => {
                    if (examMode) {
                      e.preventDefault();
                      onIntegrityEvent?.("copy_attempt");
                    }
                  }}
                  onPaste={(e) => {
                    if (examMode) {
                      e.preventDefault();
                      onIntegrityEvent?.("paste_attempt");
                    }
                  }}
                  onCut={(e) => {
                    if (examMode) {
                      e.preventDefault();
                      onIntegrityEvent?.("cut_attempt");
                    }
                  }}
                  onDrop={(e) => {
                    if (examMode) {
                      e.preventDefault();
                      onIntegrityEvent?.("drop_attempt");
                    }
                  }}
                  onContextMenu={(e) => {
                    if (examMode) {
                      e.preventDefault();
                      onIntegrityEvent?.("context_menu_attempt");
                    }
                  }}
                  disabled={readOnly}
                  spellCheck={false}
                  aria-label={`Line ${lineNumber}`}
                  className="flex-1 resize-none bg-transparent font-mono text-[13px] leading-7 outline-none disabled:opacity-70"
                  style={{
                    color: active ? "#e7f3ee" : "#d4d4d4",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function MonacoPane({
  language,
  code,
  readOnly,
  fontSize,
  minimap,
  examMode = false,
  highlightLine = null,
  onCodeChange,
  onCursorChange,
  onIntegrityEvent,
  onEditorReady,
}: MonacoPaneProps) {
  const [failed, setFailed] = useState(false);
  const mounted = useRef(false);
  const editorRef = useRef<unknown>(null);
  const monacoRef = useRef<unknown>(null);
  const decorationIdsRef = useRef<string[]>([]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (!mounted.current) {
        setFailed(true);
      }
    }, 8000);

    loader
      .init()
      .then(() => {
        window.clearTimeout(timeout);
      })
      .catch(() => {
        window.clearTimeout(timeout);
        setFailed(true);
      });

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const editor = editorRef.current as any;
    const monaco = monacoRef.current as any;
    if (!editor || !monaco) {
      return;
    }
    const model = editor.getModel();
    if (!model) {
      return;
    }

    if (highlightLine != null && Number.isFinite(highlightLine) && highlightLine > 0) {
      const lineCount = model.getLineCount();
      const safeLine = Math.min(highlightLine, Math.max(lineCount, 1));
      editor.revealLineInCenter(safeLine, monaco.editor.ScrollType.Smooth);

      const newDecorations = [
        {
          range: new monaco.Range(safeLine, 1, safeLine, model.getLineMaxColumn(safeLine)),
          options: {
            isWholeLine: true,
            className: "dry-run-highlight-line",
            inlineClassName: "dry-run-highlight-text",
            linesDecorationsClassName: "dry-run-highlight-gutter",
          },
        },
      ];
      decorationIdsRef.current = editor.deltaDecorations(decorationIdsRef.current, newDecorations);
    } else {
      decorationIdsRef.current = editor.deltaDecorations(decorationIdsRef.current, []);
    }
  }, [highlightLine, code]);

  const handleMount: OnMount = (editor, monaco) => {
    mounted.current = true;
    editorRef.current = editor;
    monacoRef.current = monaco;
    onEditorReady?.(editor);

    const position = editor.getPosition();
    if (position) {
      onCursorChange(position.lineNumber, position.column);
    }
    editor.onDidChangeCursorPosition((event) => {
      onCursorChange(event.position.lineNumber, event.position.column);
    });

    if (examMode) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC, () => {
        onIntegrityEvent?.("c_shortcut_attempt");
      });
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
        onIntegrityEvent?.("v_shortcut_attempt");
      });
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyX, () => {
        onIntegrityEvent?.("x_shortcut_attempt");
      });

      const domNode = editor.getDomNode();
      if (domNode) {
        const preventAndReport = (e: Event, type: string) => {
          e.preventDefault();
          e.stopPropagation();
          onIntegrityEvent?.(type);
        };

        domNode.addEventListener("copy", (e) => preventAndReport(e, "copy_attempt"), true);
        domNode.addEventListener("paste", (e) => preventAndReport(e, "paste_attempt"), true);
        domNode.addEventListener("cut", (e) => preventAndReport(e, "cut_attempt"), true);
        domNode.addEventListener("drop", (e) => preventAndReport(e, "drop_attempt"), true);
        domNode.addEventListener("dragover", (e) => e.preventDefault(), true);
        domNode.addEventListener("contextmenu", (e) => preventAndReport(e, "context_menu_attempt"), true);
      }
    }

    requestAnimationFrame(() => {
      editor.layout();
    });
  };

  if (failed) {
    return (
      <FallbackEditor
        language={language}
        code={code}
        readOnly={readOnly}
        examMode={examMode}
        highlightLine={highlightLine}
        onCodeChange={onCodeChange}
        onIntegrityEvent={onIntegrityEvent}
      />
    );
  }

  return (
    <div className="h-full w-full">
      <style jsx global>{`
        .dry-run-highlight-line {
          background-color: rgba(20, 184, 166, 0.18) !important;
        }
        .dry-run-highlight-text {
          color: #e7f3ee !important;
        }
        .dry-run-highlight-gutter {
          background-color: rgba(20, 184, 166, 0.28) !important;
          width: 3px !important;
          margin-left: -3px !important;
        }
      `}</style>
      <Editor
        height="100%"
        width="100%"
        theme="vs-dark"
        language={monacoLanguage(language)}
        value={code}
        onChange={(value) => {
          if (value == null) {
            return;
          }
          onCodeChange(value);
        }}
        onMount={handleMount}
        loading={
          <div className="flex h-full items-center justify-center bg-[#1e1e1e] text-sm text-[#9d9d9d]">
            Loading editor...
          </div>
        }
        options={{
          fontSize,
          fontFamily:
            "var(--font-jetbrains), 'JetBrains Mono', Consolas, 'Courier New', monospace",
          fontLigatures: true,
          minimap: { enabled: minimap, scale: 1 },
          lineNumbers: "on",
          renderLineHighlight: "all",
          guides: { indentation: true, highlightActiveIndentation: true },
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          insertSpaces: true,
          wordWrap: "off",
          padding: { top: 8, bottom: 8 },
          readOnly,
          scrollbar: {
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
          smoothScrolling: true,
          mouseWheelZoom: false,
          contextmenu: !examMode,
          folding: true,
          renderWhitespace: "selection",
          quickSuggestions: examMode ? false : true,
          suggestOnTriggerCharacters: !examMode,
          snippetSuggestions: examMode ? "none" : "inline",
          wordBasedSuggestions: examMode ? "off" : "matchingDocuments",
          dragAndDrop: !examMode,
          dropIntoEditor: { enabled: !examMode },
          selectionClipboard: !examMode,
        }}
      />
    </div>
  );
}
