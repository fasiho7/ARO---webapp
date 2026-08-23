import { PRO_REQUIRED_CODE, ACCESS_COPY } from "@/lib/access";
import { bearerAuthHeaders } from "@/lib/apiAuth";
import { publicEnv } from "@/lib/env";

export const TUTOR_ERROR =
  "Sorry, I couldn't generate a response right now. Please try again.";

export type TutorConversationTurn = {
  role: "user" | "assistant";
  content: string;
};

function apiBase(): string {
  return publicEnv.apiUrl.replace(/\/$/, "");
}

export async function askTutor(input: {
  message: string;
  conversation: TutorConversationTurn[];
}): Promise<string> {
  let response: Response;
  try {
    response = await fetch(`${apiBase()}/api/ai-tutor`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(await bearerAuthHeaders()),
      },
      body: JSON.stringify({
        message: input.message,
        conversation: input.conversation,
      }),
    });
  } catch {
    throw new Error(TUTOR_ERROR);
  }

  let payload: { success?: boolean; message?: string; code?: string } = {};
  try {
    payload = (await response.json()) as typeof payload;
  } catch {
    throw new Error(TUTOR_ERROR);
  }

  if (response.status === 403 && payload.code === PRO_REQUIRED_CODE) {
    throw new Error(
      typeof payload.message === "string" && payload.message.length > 0
        ? payload.message
        : ACCESS_COPY.aiTutor,
    );
  }

  if (!response.ok || payload.success === false) {
    throw new Error(TUTOR_ERROR);
  }
  if (typeof payload.message !== "string" || payload.message.trim().length === 0) {
    throw new Error(TUTOR_ERROR);
  }
  return payload.message.trim();
}
