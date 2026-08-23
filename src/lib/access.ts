export type UserPlan = "free" | "pro";

export const PRO_REQUIRED_CODE = "PRO_REQUIRED";

export function normalizePlan(value: unknown): UserPlan {
  return value === "pro" ? "pro" : "free";
}

export function isProPlan(plan: UserPlan): boolean {
  return plan === "pro";
}

export function canAccessProblem(plan: UserPlan, difficulty: string): boolean {
  if (isProPlan(plan)) {
    return true;
  }
  return difficulty === "Easy" || difficulty === "Beginner";
}

export function canAccessRoadmapContent(
  plan: UserPlan,
  difficulty: string,
): boolean {
  if (isProPlan(plan)) {
    return true;
  }
  return difficulty.toLowerCase() === "beginner";
}

export function canAccessProject(plan: UserPlan, level: string): boolean {
  if (isProPlan(plan)) {
    return true;
  }
  return level.toLowerCase() === "beginner";
}

export function canAccessDryRun(plan: UserPlan): boolean {
  return isProPlan(plan);
}

export function canAccessAiTutor(plan: UserPlan): boolean {
  return isProPlan(plan);
}

export const ACCESS_COPY = {
  dryRun: "Dry Run is included with Pro.",
  aiTutor: "AI Tutor is included with Pro.",
  codingProblem: "Medium and Advanced problems are included with Pro.",
  roadmap: "This roadmap content is included with Pro.",
  quizLimit:
    "Your free quiz has been used. Upgrade to Pro for unlimited quizzes.",
  quizPro:
    "Want unlimited quizzes? Upgrade to Pro to create unlimited quizzes and track your performance over time.",
} as const;
