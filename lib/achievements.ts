import {
  ACHIEVEMENT_DEFINITIONS,
  AchievementDefinition,
  AchievementId,
} from "../constants/Achievements";

export interface CalendarPlanEntry {
  date: string;
  completed?: boolean;
  stats?: {
    completedAt?: string | null;
    [key: string]: any;
  };
  [key: string]: any;
}

export type CalendarPlan = Record<string, CalendarPlanEntry>;

export interface ComputedAchievementMetrics {
  totalCompletions: number;
  currentStreak: number;
  longestStreak: number;
}

export interface ComputedAchievementState extends ComputedAchievementMetrics {
  id: AchievementId;
  progress: number;
  target: number;
  unlocked: boolean;
}

export interface UserAchievementRecord {
  achievement_id: AchievementId;
  unlocked: boolean;
  progress: number | null;
  unlocked_at: string | null;
  updated_at?: string | null;
}

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const pad = (value: number) => String(value).padStart(2, "0");

const toDateKey = (value: Date) =>
  `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;

const parseDateOnly = (value: string): Date | null => {
  if (!value || !DATE_ONLY_REGEX.test(value)) return null;
  const [y, m, d] = value.split("-").map((part) => Number(part));
  if (
    Number.isNaN(y) ||
    Number.isNaN(m) ||
    Number.isNaN(d) ||
    y < 1970 ||
    m < 1 ||
    m > 12 ||
    d < 1 ||
    d > 31
  ) {
    return null;
  }
  return new Date(y, m - 1, d);
};

const normalizeToDateKey = (value?: string | null): string | null => {
  if (!value) return null;

  if (DATE_ONLY_REGEX.test(value)) {
    const parsed = parseDateOnly(value);
    return parsed ? toDateKey(parsed) : null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return toDateKey(parsed);
};

const differenceInDays = (a: string, b: string): number => {
  const da = parseDateOnly(a);
  const db = parseDateOnly(b);
  if (!da || !db) return Number.NaN;
  const diffMs = da.getTime() - db.getTime();
  return Math.round(diffMs / (24 * 60 * 60 * 1000));
};

const collectCompletedDates = (plan: CalendarPlan | null | undefined): string[] => {
  if (!plan || typeof plan !== "object") return [];

  const dates = new Set<string>();

  Object.values(plan).forEach((entry) => {
    if (!entry || typeof entry !== "object") return;
    if (!entry.completed) return;

    const statsDate = normalizeToDateKey(entry.stats?.completedAt ?? null);
    if (statsDate) {
      dates.add(statsDate);
      return;
    }

    const entryDate =
      normalizeToDateKey(entry.date) ||
      normalizeToDateKey(typeof entry.date === "string" ? entry.date.slice(0, 10) : null);
    if (entryDate) {
      dates.add(entryDate);
    }
  });

  return Array.from(dates).sort();
};

const computeStreakMetrics = (datesAscending: string[]) => {
  if (!datesAscending.length) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  let longestStreak = 1;
  let rolling = 1;

  for (let i = 1; i < datesAscending.length; i++) {
    const diff = differenceInDays(datesAscending[i], datesAscending[i - 1]);
    if (diff === 1) {
      rolling += 1;
      longestStreak = Math.max(longestStreak, rolling);
    } else if (diff > 1) {
      rolling = 1;
    }
    // diff === 0 -> duplicate day, ignore without resetting rolling
  }

  let currentStreak = 1;
  for (let i = datesAscending.length - 1; i > 0; i--) {
    const diff = differenceInDays(datesAscending[i], datesAscending[i - 1]);
    if (diff === 1) {
      currentStreak += 1;
    } else if (diff === 0) {
      continue;
    } else {
      break;
    }
  }

  return {
    currentStreak: Math.max(currentStreak, 1),
    longestStreak: Math.max(longestStreak, 1),
  };
};

const combineMetrics = (
  definition: AchievementDefinition,
  data: ComputedAchievementMetrics
): ComputedAchievementState => {
  if (definition.id === "first_workout") {
    const progress = Math.min(data.totalCompletions > 0 ? 1 : 0, definition.target);
    const unlocked = progress >= definition.target;
    return {
      id: definition.id,
      target: definition.target,
      progress,
      unlocked,
      ...data,
    };
  }

  if (definition.id === "seven_day_challenge" || definition.id === "thirty_day_challenge") {
    const unlocked = data.longestStreak >= definition.target;
    const progress = unlocked
      ? definition.target
      : Math.min(data.currentStreak, definition.target);
    return {
      id: definition.id,
      target: definition.target,
      progress,
      unlocked,
      ...data,
    };
  }

  return {
    id: definition.id,
    target: definition.target,
    progress: 0,
    unlocked: false,
    ...data,
  };
};

export const computeAchievementsFromPlan = (
  plan: CalendarPlan | null | undefined
): Record<AchievementId, ComputedAchievementState> => {
  const completedDates = collectCompletedDates(plan);
  const totalCompletions = completedDates.length;
  const { currentStreak, longestStreak } = computeStreakMetrics(completedDates);

  return ACHIEVEMENT_DEFINITIONS.reduce<Record<AchievementId, ComputedAchievementState>>(
    (acc, definition) => {
      const metrics: ComputedAchievementMetrics = {
        totalCompletions,
        currentStreak,
        longestStreak,
      };

      acc[definition.id] = combineMetrics(definition, metrics);
      return acc;
    },
    {} as Record<AchievementId, ComputedAchievementState>
  );
};

export const createEmptyAchievementState = (): Record<
  AchievementId,
  ComputedAchievementState
> => {
  const baseMetrics: ComputedAchievementMetrics = {
    totalCompletions: 0,
    currentStreak: 0,
    longestStreak: 0,
  };

  return ACHIEVEMENT_DEFINITIONS.reduce<Record<AchievementId, ComputedAchievementState>>(
    (acc, definition) => {
      acc[definition.id] = combineMetrics(definition, baseMetrics);
      return acc;
    },
    {} as Record<AchievementId, ComputedAchievementState>
  );
};

