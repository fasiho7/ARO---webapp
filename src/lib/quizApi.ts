import { bearerAuthHeaders } from "@/lib/apiAuth";
import { publicEnv } from "@/lib/env";
import { PRO_REQUIRED_CODE } from "@/lib/access";

export class QuizApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "QuizApiError";
    this.status = status;
    this.code = code;
  }
}

export type QuizTopicOption = {
  id: string;
  label: string;
  subtopics: { id: string; label: string }[];
};

export type QuizPublicQuestion = {
  id: string;
  type?: "mcq" | "coding";
  topic: string;
  subtopic: string;
  difficulty: string;
  question: string;
  options?: string[];
  title?: string;
  problemStatement?: string;
  starterCode?: string;
  sampleCases?: { input: string; output: string }[];
  language?: string;
};

export type QuizAnswerValue = number | { code: string; language?: string };

export type QuizOverview = {
  success: true;
  plan: "free" | "pro";
  quizzesUsed: number;
  quizCount?: number;
  quizUsed?: boolean;
  quizLimit: number | null;
  canCreate: boolean;
  canCreateQuiz?: boolean;
  freeQuizUsed: boolean;
  allowedCounts: number[];
  allowedDifficulties: string[];
  allowedTimers: number[];
  catalog: { topics: QuizTopicOption[] };
  activeQuiz: {
    id: string;
    topic: string;
    topicLabel: string;
    difficulty: string;
    questionCount: number;
    expiresAt: string;
    remainingSeconds: number;
  } | null;
  latestCompletedId: string | null;
};

export type QuizSessionPayload = {
  success: true;
  quizId: string;
  topic: string;
  topicLabel: string;
  subtopic: string | null;
  difficulty: string;
  questionCount: number;
  timeLimit: number;
  startedAt: string;
  expiresAt: string;
  remainingSeconds?: number;
  status: "in_progress" | "completed" | "expired";
  draftAnswers?: Record<string, QuizAnswerValue>;
  questions?: QuizPublicQuestion[];
  requestedCount?: number;
  reduced?: boolean;
  available?: number;
  recommendedTimeLimit?: number;
  score?: number;
  total?: number;
  wrong?: number;
  percentage?: number;
  timeUsedSeconds?: number;
  feedback?: string;
  submittedAt?: string | null;
  review?: QuizReviewItem[];
};

export type QuizReviewItem = {
  id: string;
  type?: "mcq" | "coding";
  topic: string;
  subtopic: string;
  difficulty: string;
  question: string;
  options?: string[];
  yourAnswer?: number | null;
  correctAnswer?: number;
  explanation?: string;
  title?: string;
  yourCode?: string | null;
  passedTests?: number;
  totalTests?: number;
  isCorrect: boolean;
};

export type QuizHistoryItem = {
  id: string;
  createdAt: string;
  submittedAt: string | null;
  topic: string;
  topicLabel: string;
  subtopic: string | null;
  difficulty: string;
  questionCount: number;
  status: string;
  score: number | null;
  percentage: number | null;
};

export type QuizAnalytics = {
  success: true;
  quizzesCompleted: number;
  averageScore: number;
  bestScore: number;
  strongestTopic: { topic: string; average: number; count: number } | null;
  weakestTopic: { topic: string; average: number; count: number } | null;
  topicPerformance: { topic: string; average: number; count: number }[];
  topicLabels: Record<string, string>;
};

function apiBase(): string {
  return publicEnv.apiUrl.replace(/\/$/, "");
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBase()}${path}`, {
      credentials: "include",
      cache: "no-store",
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(await bearerAuthHeaders()),
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new QuizApiError("Could not reach the quiz service. Try again.", 0);
  }

  let payload: { success?: boolean; message?: string; code?: string } = {};
  try {
    payload = (await response.json()) as typeof payload;
  } catch {
    throw new QuizApiError("Could not read the quiz response.", response.status);
  }

  if (!response.ok || payload.success === false) {
    throw new QuizApiError(
      typeof payload.message === "string" && payload.message.length > 0
        ? payload.message
        : "Quiz request failed.",
      response.status,
      typeof payload.code === "string" ? payload.code : undefined,
    );
  }

  return payload as T;
}

export function isQuizProError(error: unknown): boolean {
  return (
    error instanceof QuizApiError &&
    (error.code === PRO_REQUIRED_CODE || error.code === "QUIZ_LIMIT")
  );
}

export function fetchQuizOverview(): Promise<QuizOverview> {
  return requestJson<QuizOverview>("/api/quiz/me");
}

export function createQuiz(body: {
  topic: string;
  subtopic?: string;
  difficulty: string;
  questionCount: number;
  timeLimit: number;
}): Promise<QuizSessionPayload> {
  return requestJson<QuizSessionPayload>("/api/quiz/create", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function fetchQuiz(id: string): Promise<QuizSessionPayload> {
  return requestJson<QuizSessionPayload>(`/api/quiz/${encodeURIComponent(id)}`);
}

export function saveQuizProgress(
  id: string,
  answers: Record<string, QuizAnswerValue>,
): Promise<{ success: true }> {
  return requestJson(`/api/quiz/${encodeURIComponent(id)}/progress`, {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
}

export function runQuizCode(
  quizId: string,
  questionId: string,
  sourceCode: string,
  language: string,
  stdin?: string,
): Promise<{
  success: true;
  status: string;
  stdout: string;
  stderr: string;
  compileOutput: string;
  time: string | number | null;
  memory: number | null;
}> {
  return requestJson(`/api/quiz/${encodeURIComponent(quizId)}/run-code`, {
    method: "POST",
    body: JSON.stringify({ questionId, sourceCode, language, stdin }),
  });
}

export function logQuizIntegrity(
  quizId: string,
  events: { type: string; count?: number; timestamp?: string }[],
): Promise<{ success: true }> {
  return requestJson(`/api/quiz/${encodeURIComponent(quizId)}/integrity`, {
    method: "POST",
    body: JSON.stringify({ events }),
  });
}

export function submitQuiz(
  id: string,
  answers: Record<string, QuizAnswerValue>,
): Promise<QuizSessionPayload> {
  return requestJson(`/api/quiz/${encodeURIComponent(id)}/submit`, {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
}

export function fetchQuizHistory(): Promise<{
  success: true;
  items: QuizHistoryItem[];
  limited: boolean;
}> {
  return requestJson("/api/quiz/history");
}

export function fetchQuizAnalytics(): Promise<QuizAnalytics> {
  return requestJson("/api/quiz/analytics");
}

export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
