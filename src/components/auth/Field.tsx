import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: ReactNode;
};

export function Field({ label, error, hint, className, id, ...props }: FieldProps) {
  const fieldId = id ?? props.name;

  return (
    <label className="block" htmlFor={fieldId}>
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        id={fieldId}
        className={cn(
          "mt-1.5 w-full rounded-xl border bg-surface-2 px-3.5 py-2.5 text-sm text-ink outline-none transition",
          "placeholder:text-muted/70 focus:border-blue/50 focus:ring-2 focus:ring-blue/20",
          error ? "border-danger/60" : "border-line",
          className,
        )}
        {...props}
      />
      {error ? (
        <span className="mt-1.5 block text-xs text-danger">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-muted">{hint}</span>
      ) : null}
    </label>
  );
}
