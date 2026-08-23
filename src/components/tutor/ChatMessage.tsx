import type { ChatMessage as ChatMessageType } from "@/data/mock/types";
import { cn } from "@/lib/cn";

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user";

  return (
    <article
      className={cn(
        "flex gap-3 animate-fade-up",
        isUser ? "flex-row-reverse" : "",
      )}
    >
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold",
          isUser
            ? "border border-line bg-surface-2 text-muted"
            : "grad-bg text-white",
        )}
      >
        {isUser ? "AK" : "A"}
      </div>
      <div className="min-w-0 max-w-[min(100%,42rem)] space-y-2">
        {message.blocks.map((block, index) => {
          if (block.type === "text") {
            return (
              <div
                key={`${message.id}-${index}`}
                className="rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-sm leading-6 text-ink"
              >
                {block.text}
              </div>
            );
          }
          if (block.type === "code") {
            return (
              <pre
                key={`${message.id}-${index}`}
                className="overflow-x-auto rounded-xl border border-line bg-void p-4 font-mono text-[13px] leading-7 text-[#c9cce0] [data-theme=light]:text-ink"
              >
                <span className="mb-2 block font-mono text-[11px] text-muted">
                  {block.language}
                </span>
                <code>{block.code}</code>
              </pre>
            );
          }
          return (
            <div
              key={`${message.id}-${index}`}
              className="rounded-xl border border-teal/25 bg-teal/8 px-3.5 py-3"
            >
              <p className="font-mono text-[11px] text-teal">Try this</p>
              <p className="mt-1 text-sm leading-6 text-ink">{block.prompt}</p>
            </div>
          );
        })}
      </div>
    </article>
  );
}
