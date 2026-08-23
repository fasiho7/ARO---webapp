import type { ChatBlock } from "@/data/mock/types";

const FENCE = /```([a-zA-Z0-9_+-]*)\r?\n([\s\S]*?)```/g;

export function parseTutorMarkdown(markdown: string): ChatBlock[] {
  const blocks: ChatBlock[] = [];
  let lastIndex = 0;
  const source = markdown.trim();
  if (!source) {
    return [{ type: "text", text: "Sorry, I couldn't generate a response right now. Please try again." }];
  }

  for (const match of source.matchAll(FENCE)) {
    const index = match.index ?? 0;
    const before = source.slice(lastIndex, index).trim();
    if (before) {
      blocks.push({ type: "text", text: before });
    }
    blocks.push({
      type: "code",
      language: match[1] || "text",
      code: (match[2] ?? "").replace(/\n$/, ""),
    });
    lastIndex = index + match[0].length;
  }

  const rest = source.slice(lastIndex).trim();
  if (rest) {
    blocks.push({ type: "text", text: rest });
  }
  if (blocks.length === 0) {
    blocks.push({ type: "text", text: source });
  }
  return blocks;
}

export function blocksToPlainText(blocks: ChatBlock[]): string {
  return blocks
    .map((block) => {
      if (block.type === "text") {
        return block.text;
      }
      if (block.type === "code") {
        return `\`\`\`${block.language}\n${block.code}\n\`\`\``;
      }
      return block.prompt;
    })
    .join("\n\n")
    .trim();
}
