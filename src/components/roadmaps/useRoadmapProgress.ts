"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import type { CareerRoadmap, RoadmapProgressStatus } from "@/data/roadmaps/types";
import { isSupabasePublicConfigured } from "@/lib/env";
import {
  fetchRoadmapProgressRemote,
  saveRoadmapProgressRemote,
} from "@/lib/progressSync";
import {
  emptyRoadmapProgress,
  mergeRoadmapProgress,
  readRoadmapProgress,
  roadmapProgressEquals,
  roadmapProgressStorageKey,
  setEntityStatus,
  setPathTopicStatus,
  writeRoadmapProgress,
  type RoadmapProgressStore,
} from "@/lib/roadmapProgress";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const EMPTY_STORE: RoadmapProgressStore = emptyRoadmapProgress();
const EVENT = "aro-roadmap-progress";
const cache = new Map<string, { raw: string; store: RoadmapProgressStore }>();

function cacheKey(userId: string | null): string {
  return userId ?? "guest";
}

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener(EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot(userId: string | null): RoadmapProgressStore {
  let raw = "";
  try {
    raw = window.localStorage.getItem(roadmapProgressStorageKey(userId)) ?? "";
  } catch {
    return EMPTY_STORE;
  }
  const key = cacheKey(userId);
  const cached = cache.get(key);
  if (cached && cached.raw === raw) {
    return cached.store;
  }
  const store = raw ? readRoadmapProgress(userId) : EMPTY_STORE;
  cache.set(key, { raw, store });
  return store;
}

function getServerSnapshot(): RoadmapProgressStore {
  return EMPTY_STORE;
}

export function useRoadmapProgress() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [syncedUserId, setSyncedUserId] = useState<string | null>(null);
  const [errorUserId, setErrorUserId] = useState<string | null>(null);
  const store = useSyncExternalStore(
    subscribe,
    () => getSnapshot(userId),
    getServerSnapshot,
  );
  const remoteEnabled = Boolean(userId) && isSupabasePublicConfigured();
  const syncing = remoteEnabled && syncedUserId !== userId;
  const error = remoteEnabled && errorUserId === userId;

  useEffect(() => {
    if (!userId || !isSupabasePublicConfigured()) {
      return;
    }
    const id = userId;
    let cancelled = false;

    async function hydrate() {
      try {
        const supabase = createBrowserSupabaseClient();
        const remote = await fetchRoadmapProgressRemote(supabase, id);
        if (cancelled) {
          return;
        }
        const local = readRoadmapProgress(id);
        if (!remote) {
          if (local.records.length > 0) {
            void saveRoadmapProgressRemote(supabase, id, local);
          }
          setErrorUserId((current) => (current === id ? null : current));
          setSyncedUserId(id);
          return;
        }
        const merged = mergeRoadmapProgress(local, remote);
        writeRoadmapProgress(merged, id);
        window.dispatchEvent(new Event(EVENT));
        if (!roadmapProgressEquals(merged, remote)) {
          void saveRoadmapProgressRemote(supabase, id, merged);
        }
        setErrorUserId((current) => (current === id ? null : current));
        setSyncedUserId(id);
      } catch (cause) {
        console.error("Failed to sync roadmap progress", cause);
        if (!cancelled) {
          setErrorUserId(id);
          setSyncedUserId(id);
        }
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const setStatus = useCallback(
    (
      career: CareerRoadmap,
      entity: {
        stageId?: string;
        topicId?: string;
        projectId?: string;
        milestoneId?: string;
      },
      status: RoadmapProgressStatus,
    ) => {
      const next = setEntityStatus(
        career,
        readRoadmapProgress(userId),
        entity,
        status,
      );
      writeRoadmapProgress(next, userId);
      window.dispatchEvent(new Event(EVENT));
      if (userId && isSupabasePublicConfigured()) {
        try {
          const supabase = createBrowserSupabaseClient();
          void saveRoadmapProgressRemote(supabase, userId, next);
        } catch {
          // Local cache still holds the update.
        }
      }
    },
    [userId],
  );

  const setPathTopic = useCallback(
    (pathId: string, topicId: string, status: RoadmapProgressStatus) => {
      const next = setPathTopicStatus(
        readRoadmapProgress(userId),
        pathId,
        topicId,
        status,
      );
      writeRoadmapProgress(next, userId);
      window.dispatchEvent(new Event(EVENT));
      if (userId && isSupabasePublicConfigured()) {
        try {
          const supabase = createBrowserSupabaseClient();
          void saveRoadmapProgressRemote(supabase, userId, next);
        } catch {
          // Local cache still holds the update.
        }
      }
    },
    [userId],
  );

  return { store, setStatus, setPathTopic, syncing, error };
}
