"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  codingProgressEquals,
  codingProgressStorageKey,
  clearGuestCodingProgress,
  mergeCodingProgress,
  readCodingProgress,
  setProblemComplete,
  writeCodingProgress,
  type CodingProgressStore,
} from "@/lib/codingProgress";
import { isSupabasePublicConfigured } from "@/lib/env";
import {
  fetchCodingProgressRemote,
  saveCodingProgressRemote,
} from "@/lib/progressSync";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const EMPTY_STORE: CodingProgressStore = { completedIds: [] };
const EVENT = "aro-coding-progress";
const cache = new Map<string, { raw: string; store: CodingProgressStore }>();

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

function getSnapshot(userId: string | null): CodingProgressStore {
  let raw = "";
  try {
    raw = window.localStorage.getItem(codingProgressStorageKey(userId)) ?? "";
  } catch {
    return EMPTY_STORE;
  }
  const key = cacheKey(userId);
  const cached = cache.get(key);
  if (cached && cached.raw === raw) {
    return cached.store;
  }
  const store = raw ? readCodingProgress(userId) : EMPTY_STORE;
  cache.set(key, { raw, store });
  return store;
}

function getServerSnapshot(): CodingProgressStore {
  return EMPTY_STORE;
}

export function useCodingProgress() {
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
        const remote = await fetchCodingProgressRemote(supabase, id);
        if (cancelled) {
          return;
        }
        const guest = readCodingProgress(null);
        const local = readCodingProgress(id);
        const fromDevice = mergeCodingProgress(guest, local);
        if (!remote) {
          if (fromDevice.completedIds.length > 0) {
            writeCodingProgress(fromDevice, id);
            window.dispatchEvent(new Event(EVENT));
            void saveCodingProgressRemote(supabase, id, fromDevice);
          }
          if (guest.completedIds.length > 0) {
            clearGuestCodingProgress();
            window.dispatchEvent(new Event(EVENT));
          }
          setErrorUserId((current) => (current === id ? null : current));
          setSyncedUserId(id);
          return;
        }
        const merged = mergeCodingProgress(fromDevice, remote);
        writeCodingProgress(merged, id);
        if (guest.completedIds.length > 0) {
          clearGuestCodingProgress();
        }
        window.dispatchEvent(new Event(EVENT));
        if (!codingProgressEquals(merged, remote)) {
          void saveCodingProgressRemote(supabase, id, merged);
        }
        setErrorUserId((current) => (current === id ? null : current));
        setSyncedUserId(id);
      } catch (cause) {
        console.error("Failed to sync coding progress", cause);
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

  const markComplete = useCallback(
    (id: string, complete = true) => {
      const next = setProblemComplete(readCodingProgress(userId), id, complete);
      writeCodingProgress(next, userId);
      window.dispatchEvent(new Event(EVENT));
      if (userId && isSupabasePublicConfigured()) {
        try {
          const supabase = createBrowserSupabaseClient();
          void saveCodingProgressRemote(supabase, userId, next);
        } catch {
          // Local cache still holds the update.
        }
      }
    },
    [userId],
  );

  return { store, markComplete, syncing, error };
}
