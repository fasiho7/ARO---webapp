export function problemProgressId(
  trackId: string,
  topicSlug: string,
  problemSlug: string,
): string {
  return `${trackId}/${topicSlug}/${problemSlug}`;
}

export type CodingProgressStore = {
  completedIds: string[];
};

export const CODING_PROGRESS_KEY = "aro.coding.progress.v1";

export function codingProgressStorageKey(userId?: string | null): string {
  return userId ? `${CODING_PROGRESS_KEY}.${userId}` : CODING_PROGRESS_KEY;
}

function emptyStore(): CodingProgressStore {
  return { completedIds: [] };
}

export function readCodingProgress(userId?: string | null): CodingProgressStore {
  if (typeof window === "undefined") {
    return emptyStore();
  }
  try {
    const raw = window.localStorage.getItem(codingProgressStorageKey(userId));
    if (!raw) {
      return emptyStore();
    }
    const parsed = JSON.parse(raw) as CodingProgressStore;
    if (!Array.isArray(parsed.completedIds)) {
      return emptyStore();
    }
    return { completedIds: parsed.completedIds };
  } catch {
    return emptyStore();
  }
}

export function writeCodingProgress(
  store: CodingProgressStore,
  userId?: string | null,
): void {
  window.localStorage.setItem(
    codingProgressStorageKey(userId),
    JSON.stringify(store),
  );
}

export function clearGuestCodingProgress(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(CODING_PROGRESS_KEY);
}

export function mergeCodingProgress(
  local: CodingProgressStore,
  remote: CodingProgressStore,
): CodingProgressStore {
  return {
    completedIds: [...new Set([...local.completedIds, ...remote.completedIds])],
  };
}

export function codingProgressEquals(
  a: CodingProgressStore,
  b: CodingProgressStore,
): boolean {
  if (a.completedIds.length !== b.completedIds.length) {
    return false;
  }
  const remote = new Set(b.completedIds);
  return a.completedIds.every((id) => remote.has(id));
}

export function isProblemComplete(
  store: CodingProgressStore,
  id: string,
): boolean {
  return store.completedIds.includes(id);
}

export function setProblemComplete(
  store: CodingProgressStore,
  id: string,
  complete: boolean,
): CodingProgressStore {
  const next = new Set(store.completedIds);
  if (complete) {
    next.add(id);
  } else {
    next.delete(id);
  }
  return { completedIds: [...next] };
}

export function countCompletedInTopic(
  store: CodingProgressStore,
  trackId: string,
  topicSlug: string,
  problemSlugs: string[],
): number {
  return problemSlugs.filter((slug) =>
    isProblemComplete(store, problemProgressId(trackId, topicSlug, slug)),
  ).length;
}

