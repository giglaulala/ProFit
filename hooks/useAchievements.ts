import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ACHIEVEMENT_DEFINITIONS,
  AchievementDefinition,
  AchievementId,
} from "../constants/Achievements";
import {
  CalendarPlan,
  ComputedAchievementState,
  UserAchievementRecord,
  computeAchievementsFromPlan,
  createEmptyAchievementState,
} from "../lib/achievements";
import { supabase } from "../lib/supabase";

export interface AchievementViewModel {
  id: AchievementId;
  titleKey: string;
  descriptionKey: string;
  icon: AchievementDefinition["icon"];
  colorKey: AchievementDefinition["colorKey"];
  unlocked: boolean;
  unlockedAt: string | null;
  progress: number;
  target: number;
  metrics: {
    totalCompletions: number;
    currentStreak: number;
    longestStreak: number;
  };
}

type AchievementRecordMap = Record<AchievementId, UserAchievementRecord>;
type ComputedMap = Record<AchievementId, ComputedAchievementState>;

const buildDefaultRecord = (definition: AchievementDefinition): UserAchievementRecord => ({
  achievement_id: definition.id,
  unlocked: false,
  progress: 0,
  unlocked_at: null,
  updated_at: null,
});

const ensureRecordMap = (
  source: Partial<AchievementRecordMap> | null | undefined
): AchievementRecordMap => {
  return ACHIEVEMENT_DEFINITIONS.reduce<AchievementRecordMap>((acc, definition) => {
    const existing = source?.[definition.id];
    acc[definition.id] = existing
      ? {
          achievement_id: definition.id,
          unlocked: Boolean(existing.unlocked),
          unlocked_at: existing.unlocked_at ?? null,
          progress:
            typeof existing.progress === "number"
              ? existing.progress
              : existing.unlocked
              ? definition.target
              : 0,
          updated_at: existing.updated_at ?? null,
        }
      : buildDefaultRecord(definition);
    return acc;
  }, {} as AchievementRecordMap);
};

const buildViewModel = (
  records: AchievementRecordMap,
  computed: ComputedMap
): AchievementViewModel[] => {
  return ACHIEVEMENT_DEFINITIONS.map((definition) => {
    const record = records[definition.id];
    const computedState = computed[definition.id];

    const unlocked = record?.unlocked || computedState?.unlocked || false;
    const unlockedAt = record?.unlocked_at ?? null;

    const baseProgress =
      unlocked && definition ? definition.target : computedState?.progress ?? 0;

    return {
      id: definition.id,
      titleKey: definition.titleKey,
      descriptionKey: definition.descriptionKey,
      icon: definition.icon,
      colorKey: definition.colorKey,
      unlocked,
      unlockedAt,
      progress: Math.min(baseProgress, definition.target),
      target: definition.target,
      metrics: {
        totalCompletions: computedState?.totalCompletions ?? 0,
        currentStreak: computedState?.currentStreak ?? 0,
        longestStreak: computedState?.longestStreak ?? 0,
      },
    };
  });
};

export const useAchievements = () => {
  const [records, setRecords] = useState<AchievementRecordMap>(() =>
    ensureRecordMap({})
  );
  const [computed, setComputed] = useState<ComputedMap>(() =>
    createEmptyAchievementState()
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) {
        setRecords(ensureRecordMap({}));
        return;
      }

      const { data, error: selectError } = await supabase
        .from("user_achievements")
        .select("achievement_id, unlocked, progress, unlocked_at, updated_at");

      if (selectError) {
        console.warn("[useAchievements] Failed to load user achievements:", selectError);
        setRecords(ensureRecordMap({}));
        setError(selectError.message);
        return;
      }

      const map = Array.isArray(data)
        ? data.reduce<Partial<AchievementRecordMap>>((acc, row) => {
            if (!row || !row.achievement_id) return acc;
            acc[row.achievement_id as AchievementId] = {
              achievement_id: row.achievement_id as AchievementId,
              unlocked: Boolean(row.unlocked),
              progress:
                typeof row.progress === "number"
                  ? row.progress
                  : row.unlocked
                  ? ACHIEVEMENT_DEFINITIONS.find(
                      (def) => def.id === (row.achievement_id as AchievementId)
                    )?.target ?? 0
                  : 0,
              unlocked_at: row.unlocked_at ?? null,
              updated_at: row.updated_at ?? null,
            };
            return acc;
          }, {})
        : {};
      setRecords(ensureRecordMap(map));
    } catch (err: any) {
      console.warn("[useAchievements] Unexpected error loading achievements:", err);
      setError(err?.message ?? "Failed to load achievements");
      setRecords(ensureRecordMap({}));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const viewModel = useMemo(() => buildViewModel(records, computed), [records, computed]);

  const evaluatePlan = useCallback(
    async (plan: CalendarPlan | null | undefined) => {
      const computedState = computeAchievementsFromPlan(plan);
      setComputed(computedState);

      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) {
        return {
          newlyUnlocked: [] as AchievementViewModel[],
          updatedAchievements: buildViewModel(records, computedState),
        };
      }

      const nowIso = new Date().toISOString();
      const updates: Array<{
        user_id: string;
        achievement_id: AchievementId;
        unlocked: boolean;
        progress: number;
        unlocked_at: string | null;
      }> = [];

      const nextRecords: AchievementRecordMap = { ...records };
      const newlyUnlockedIds: AchievementId[] = [];

      ACHIEVEMENT_DEFINITIONS.forEach((definition) => {
        const computedAchievement = computedState[definition.id];
        const existing = records[definition.id];

        const wasUnlocked = existing?.unlocked ?? false;
        const shouldUnlock = computedAchievement.unlocked;
        const nextUnlocked = wasUnlocked || shouldUnlock;

        let unlockedAt = existing?.unlocked_at ?? null;
        if (shouldUnlock && !wasUnlocked) {
          unlockedAt = nowIso;
          newlyUnlockedIds.push(definition.id);
        }

        const nextProgress = nextUnlocked
          ? definition.target
          : Math.min(computedAchievement.progress, definition.target);

        const progressChanged = (existing?.progress ?? 0) !== nextProgress;
        const unlockChanged = nextUnlocked !== wasUnlocked;

        if (progressChanged || unlockChanged || !existing) {
          updates.push({
            user_id: userId,
            achievement_id: definition.id,
            unlocked: nextUnlocked,
            progress: nextProgress,
            unlocked_at: nextUnlocked ? unlockedAt : null,
          });
        }

        nextRecords[definition.id] = {
          achievement_id: definition.id,
          unlocked: nextUnlocked,
          progress: nextProgress,
          unlocked_at: unlockedAt,
          updated_at: existing?.updated_at ?? null,
        };
      });

      if (updates.length) {
        const { error: upsertError } = await supabase
          .from("user_achievements")
          .upsert(updates, { onConflict: "user_id,achievement_id" });

        if (upsertError) {
          console.warn("[useAchievements] Failed to upsert achievements:", upsertError);
          return {
            newlyUnlocked: [] as AchievementViewModel[],
            updatedAchievements: buildViewModel(records, computedState),
          };
        }

        setRecords(ensureRecordMap(nextRecords));
      } else {
        // Even without updates, ensure computed state is reflected for view
        setRecords((prev) => ensureRecordMap(prev));
      }

      const fullView = buildViewModel(
        ensureRecordMap(nextRecords),
        computedState
      );
      const newlyUnlocked = fullView.filter((a) => newlyUnlockedIds.includes(a.id));

      return {
        newlyUnlocked,
        updatedAchievements: fullView,
      };
    },
    [records]
  );

  return {
    achievements: viewModel,
    loading,
    error,
    refresh: load,
    evaluatePlan,
  };
};

