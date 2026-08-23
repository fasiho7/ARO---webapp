import type { CodingLanguage, CodingProblem, ProblemDifficulty } from "./types";

export function defaultStarter(
  title: string,
): Record<CodingLanguage, string> {
  return {
    "C++": `// ${title}
#include <iostream>
using namespace std;

int main() {
    // write your solution
    return 0;
}
`,
    C: `/* ${title} */
#include <stdio.h>

int main(void) {
    /* write your solution */
    return 0;
}
`,
    Python: `# ${title}

def solve():
    # write your solution
    pass

if __name__ == "__main__":
    solve()
`,
    Java: `// ${title}
public class Main {
    public static void main(String[] args) {
        // write your solution
    }
}
`,
  };
}

export function makeProblem(
  number: number,
  slug: string,
  title: string,
  difficulty: ProblemDifficulty,
  summary: string,
  hints: string[],
  options?: {
    description?: string;
    examples?: CodingProblem["examples"];
    constraints?: string[];
    sampleStdin?: string;
    ioFormat?: string;
  },
): CodingProblem {
  return {
    number,
    slug,
    title,
    difficulty,
    summary,
    description: options?.description ?? summary,
    examples: options?.examples ?? [],
    constraints: options?.constraints ?? [
      "Use only the concepts from this topic.",
      "1 <= test cases conceptually fit in beginner practice.",
      "Read from stdin and write the answer to stdout.",
    ],
    hints,
    starterCode: defaultStarter(title),
    sampleStdin: options?.sampleStdin,
    ioFormat: options?.ioFormat,
  };
}
