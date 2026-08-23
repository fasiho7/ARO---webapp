import { createRequire } from "node:module";
import { join } from "node:path";
import type { SampleCase } from "@/lib/codingApi";

function isSampleCase(value: unknown): value is SampleCase {
  if (!value || typeof value !== "object") {
    return false;
  }
  const item = value as { input?: unknown; output?: unknown };
  return typeof item.input === "string" && typeof item.output === "string";
}

export function catalogPublicSamples(problemId: string): SampleCase[] {
  try {
    const nodeRequire = createRequire(join(process.cwd(), "package.json"));
    const tests = nodeRequire("./backend/src/data/codingTestCases.js") as {
      getPublicSamples?: (id: string) => unknown;
    };
    const samples = tests.getPublicSamples?.(problemId);
    if (!Array.isArray(samples)) {
      return [];
    }
    return samples.filter(isSampleCase);
  } catch {
    return [];
  }
}
