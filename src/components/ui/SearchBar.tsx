"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function SearchBar({
  value,
  onChange,
  placeholder = "Search",
  className,
}: SearchBarProps) {
  return (
    <label
      className={cn(
        "flex min-h-11 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-sm",
        "focus-within:border-blue/50",
        className,
      )}
    >
      <Search className="size-4 shrink-0 text-muted" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full min-w-0 bg-transparent py-2.5 text-ink outline-none placeholder:text-muted"
      />
    </label>
  );
}
