"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { ChatInput } from "@/components/tutor/ChatInput";
import { ChatMessage } from "@/components/tutor/ChatMessage";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { suggestedTopics, tutorActions } from "@/data/mock";
import type { ChatMessage as ChatMessageType, Conversation } from "@/data/mock/types";
import { cn } from "@/lib/cn";
import { askTutor, TUTOR_ERROR } from "@/lib/tutorApi";
import { blocksToPlainText, parseTutorMarkdown } from "@/lib/tutorBlocks";

function newConversation(): Conversation {
  return {
    id: `new-${Date.now()}`,
    title: "New conversation",
    updated: "Just now",
    messages: [],
  };
}

export function TutorWorkspace() {
  const [items, setItems] = useState<Conversation[]>(() => [newConversation()]);
  const [activeId, setActiveId] = useState(() => items[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const active = useMemo(
    () => items.find((item) => item.id === activeId),
    [items, activeId],
  );

  function startNew() {
    const next = newConversation();
    setItems((current) => [next, ...current]);
    setActiveId(next.id);
    setDraft("");
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || !active || sending) {
      return;
    }
    const userMessage: ChatMessageType = {
      id: `u-${Date.now()}`,
      role: "user",
      blocks: [{ type: "text", text: trimmed }],
    };
    const history = [...active.messages, userMessage];
    const conversation = active.messages
      .map((message) => ({
        role: message.role,
        content: blocksToPlainText(message.blocks),
      }))
      .filter((turn) => turn.content.length > 0);

    setDraft("");
    setSending(true);
    setItems((current) =>
      current.map((item) =>
        item.id === active.id
          ? {
              ...item,
              title: item.messages.length === 0 ? trimmed.slice(0, 28) : item.title,
              updated: "Just now",
              messages: history,
            }
          : item,
      ),
    );

    try {
      const replyText = await askTutor({
        message: trimmed,
        conversation,
      });
      const reply: ChatMessageType = {
        id: `a-${Date.now()}`,
        role: "assistant",
        blocks: parseTutorMarkdown(replyText),
      };
      setItems((current) =>
        current.map((item) =>
          item.id === active.id
            ? { ...item, messages: [...item.messages, reply] }
            : item,
        ),
      );
    } catch {
      const reply: ChatMessageType = {
        id: `a-${Date.now()}`,
        role: "assistant",
        blocks: [{ type: "text", text: TUTOR_ERROR }],
      };
      setItems((current) =>
        current.map((item) =>
          item.id === active.id
            ? { ...item, messages: [...item.messages, reply] }
            : item,
        ),
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-4 lg:min-h-[calc(100vh-4rem)] lg:flex-row">
      <aside className="w-full shrink-0 lg:w-72">
        <Button variant="secondary" className="w-full" onClick={startNew}>
          <Plus className="size-4" />
          New conversation
        </Button>
        <ul className="mt-3 space-y-1">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setActiveId(item.id)}
                className={cn(
                  "w-full rounded-xl px-3 py-2.5 text-left transition",
                  item.id === activeId
                    ? "bg-white/8 [data-theme=light]:bg-black/6"
                    : "hover:bg-white/5 [data-theme=light]:hover:bg-black/5",
                )}
              >
                <span className="block truncate text-sm font-medium text-ink">
                  {item.title}
                </span>
                <span className="text-xs text-muted">{item.updated}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col rounded-2xl border border-line bg-surface">
        <header className="border-b border-line px-5 py-4">
          <h1 className="display text-lg font-semibold">AI Tutor</h1>
          <p className="text-sm text-muted">Your personal programming tutor.</p>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5">
          {active && active.messages.length > 0 ? (
            active.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          ) : (
            <EmptyState
              title="Start a conversation"
              description="Ask about pointers, OOP, recursion, or pick a topic below."
            />
          )}
          {sending ? (
            <p className="text-xs text-muted">Aro is thinking…</p>
          ) : null}
        </div>

        <div className="border-t border-line px-4 py-4 sm:px-5">
          <div className="mb-3 flex flex-wrap gap-2">
            {tutorActions.map((action) => (
              <button
                key={action}
                type="button"
                className="rounded-full border border-line px-3 py-1 text-xs font-medium text-muted hover:text-ink"
                onClick={() => setDraft(`${action}: `)}
              >
                {action}
              </button>
            ))}
          </div>
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {suggestedTopics.map((topic) => (
              <button
                key={topic}
                type="button"
                className="shrink-0 rounded-full bg-surface-2 px-3 py-1 text-xs text-muted hover:text-ink"
                onClick={() => void send(`Explain ${topic}`)}
              >
                {topic}
              </button>
            ))}
          </div>
          <ChatInput
            value={draft}
            onChange={setDraft}
            onSend={() => void send(draft)}
            disabled={sending}
          />
        </div>
      </section>
    </div>
  );
}
