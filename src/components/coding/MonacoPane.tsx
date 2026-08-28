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
  onCodeChange: (code: string) => void;
  onCursorChange: (line: number, column: number) => void;
  onIntegrityEvent?: (eventType: string) => void;
};

function FallbackEditor({
  language,
  code,
  readOnly,
  examMode,
  onCodeChange,
  onIntegrityEvent,
}: Pick<
  MonacoPaneProps,
  "language" | "code" | "readOnly" | "examMode" | "onCodeChange" | "onIntegrityEvent"
>) {
  const lines = Math.max(code.split("\n").length, 1);

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
      <textarea
        value={code}
        onChange={(event) => onCodeChange(event.target.value)}
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
        onKeyDown={(e) => {
          if (
            examMode &&
            (e.ctrlKey || e.metaKey) &&
            ["c", "v", "x"].includes(e.key.toLowerCase())
          ) {
            e.preventDefault();
            onIntegrityEvent?.(`${e.key.toLowerCase()}_shortcut_attempt`);
          }
        }}
        spellCheck={false}
        disabled={readOnly}
        aria-label={`${language} code editor`}
        className="min-h-[380px] min-w-0 flex-1 resize-none bg-[#1e1e1e] p-3 font-mono text-[13px] leading-7 text-[#d4d4d4] outline-none disabled:opacity-70"
      />
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
  onCodeChange,
  onCursorChange,
  onIntegrityEvent,
}: MonacoPaneProps) {
  const [failed, setFailed] = useState(false);
  const mounted = useRef(false);

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

  const handleMount: OnMount = (editor, monaco) => {
    mounted.current = true;
    const position = editor.getPosition();
    if (position) {
      onCursorChange(position.lineNumber, position.column);
    }
    editor.onDidChangeCursorPosition((event) => {
      onCursorChange(event.position.lineNumber, event.position.column);
    });

    if (examMode) {
      // Layer 1 — override Monaco's internal clipboard action pipeline via addCommand.
      // This is more reliable than onKeyDown/preventDefault because addCommand replaces
      // the built-in handler at the command-registry level before Monaco dispatches it.
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC, () => {
        onIntegrityEvent?.("c_shortcut_attempt");
      });
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
        onIntegrityEvent?.("v_shortcut_attempt");
      });
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyX, () => {
        onIntegrityEvent?.("x_shortcut_attempt");
      });

      // Layer 2 — intercept raw DOM clipboard/context-menu events on the editor DOM node.
      // Catches browser-level paths (Edit menu, right-click via accessibility tools, drops).
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
        onCodeChange={onCodeChange}
        onIntegrityEvent={onIntegrityEvent}
      />
    );
  }

  return (
    <div className="h-full w-full">
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
          // Prevent drag-and-drop text movement in exam mode.
          dragAndDrop: !examMode,
          dropIntoEditor: { enabled: !examMode },
          // Prevent Linux middle-click selection-paste in exam mode.
          selectionClipboard: !examMode,
        }}
      />
    </div>
  );
}
