export function isPlaceholderText(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return (
    normalized.length === 0 ||
    normalized === "see problem statement" ||
    normalized === "see the examples." ||
    normalized === "see the examples"
  );
}

export function realExamples<T extends { input: string; output: string }>(
  examples: T[],
): T[] {
  return examples.filter(
    (item) =>
      !isPlaceholderText(item.input) && !isPlaceholderText(item.output),
  );
}

export function parseIoFormat(raw?: string): {
  input: string[];
  output: string[];
} | null {
  if (!raw?.trim()) {
    return null;
  }

  const [inputPart = "", outputPart = ""] = raw.split(/\n\s*Output:\s*/i);
  const input = inputPart
    .replace(/^Input:\s*/i, "")
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const output = outputPart
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (input.length === 0 && output.length === 0) {
    return null;
  }

  return {
    input,
    output,
  };
}

export function monacoLanguage(language: string): string {
  if (language === "C++") return "cpp";
  if (language === "C") return "c";
  if (language === "Python") return "python";
  if (language === "Java") return "java";
  return "plaintext";
}
