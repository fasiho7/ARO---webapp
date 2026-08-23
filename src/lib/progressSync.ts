import type { SupabaseClient } from "@supabase/supabase-js";
import type { CodingProgressStore } from "@/lib/codingProgress";
import {
  parseRoadmapProgress,
  type RoadmapProgressStore,
} from "@/lib/roadmapProgress";

export async function fetchCodingProgressRemote(
  supabase: SupabaseClient,
  userId: string,
): Promise<CodingProgressStore | null> {
  const { data, error } = await supabase
    .from("coding_progress")
    .select("completed_ids")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load coding progress", error.message);
    return null;
  }
  if (!data) {
    return null;
  }
  const ids = data.completed_ids;
  if (!Array.isArray(ids)) {
    return { completedIds: [] };
  }
  return {
    completedIds: ids.filter((id): id is string => typeof id === "string"),
  };
}

export async function saveCodingProgressRemote(
  supabase: SupabaseClient,
  userId: string,
  store: CodingProgressStore,
): Promise<void> {
  const { error } = await supabase.from("coding_progress").upsert(
    {
      user_id: userId,
      completed_ids: store.completedIds,
    },
    { onConflict: "user_id" },
  );
  if (error) {
    console.error("Failed to save coding progress", error.message);
  }
}

export async function fetchRoadmapProgressRemote(
  supabase: SupabaseClient,
  userId: string,
): Promise<RoadmapProgressStore | null> {
  const { data, error } = await supabase
    .from("roadmap_progress")
    .select("records")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load roadmap progress", error.message);
    return null;
  }
  if (!data) {
    return null;
  }
  return parseRoadmapProgress(JSON.stringify({ records: data.records }));
}

export async function saveRoadmapProgressRemote(
  supabase: SupabaseClient,
  userId: string,
  store: RoadmapProgressStore,
): Promise<void> {
  const { error } = await supabase.from("roadmap_progress").upsert(
    {
      user_id: userId,
      records: store.records,
    },
    { onConflict: "user_id" },
  );
  if (error) {
    console.error("Failed to save roadmap progress", error.message);
  }
}
