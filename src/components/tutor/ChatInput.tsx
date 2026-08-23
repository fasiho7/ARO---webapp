"use client";

import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

export function ChatInput({ value, onChange, onSend, disabled }: ChatInputProps) {
  return (
    <form
      className="flex items-end gap-2 rounded-2xl border border-line bg-surface p-2"
      onSubmit={(event) => {
        event.preventDefault();
        onSend();
      }}
    >
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Ask Aro anything..."
        rows={1}
        className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted"
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSend();
          }
        }}
      />
      <Button type="submit" disabled={disabled || value.trim().length === 0} size="sm">
        Send
        <Send className="size-3.5" />
      </Button>
    </form>
  );
}
