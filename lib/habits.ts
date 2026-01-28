import { Habit, HabitCompletion, HabitWithStats } from "@/types";
import { getTodayString, getPreviousDay, compareDates, getLastNDays } from "./date-utils";

/**
 * Calculate current streak for a habit
 */
export function calculateStreak(
  completions: HabitCompletion[],
  startFromToday: boolean = true
): number {
  if (completions.length === 0) return 0;

  // Sort completions by date descending
  const sorted = [...completions].sort((a, b) =>
    compareDates(b.completedDate, a.completedDate)
  );

  let streak = 0;
  let checkDate = getTodayString();

  // If today isn't completed and we want to start from today, return 0
  // If we start from yesterday, check yesterday
  if (!startFromToday || (sorted[0] && sorted[0].completedDate !== getTodayString())) {
    checkDate = getPreviousDay(checkDate);
  }

  // Count consecutive days backwards
  for (const completion of sorted) {
    if (completion.completedDate === checkDate) {
      streak++;
      checkDate = getPreviousDay(checkDate);
    } else if (compareDates(completion.completedDate, checkDate) < 0) {
      // completion is before checkDate, streak is broken
      break;
    }
  }

  return streak;
}

/**
 * Calculate longest streak from all completions
 */
export function calculateLongestStreak(completions: HabitCompletion[]): number {
  if (completions.length === 0) return 0;

  const sorted = [...completions].sort((a, b) =>
    compareDates(a.completedDate, b.completedDate)
  );

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prevDate = sorted[i - 1].completedDate;
    const currDate = sorted[i].completedDate;

    // Check if dates are consecutive
    const expectedNext = getPreviousDay(currDate);
    if (prevDate === expectedNext) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return maxStreak;
}

/**
 * Calculate completion rate for last N days
 */
export function calculateCompletionRate(
  completions: HabitCompletion[],
  habit: Habit,
  days: number
): number {
  const lastNDays = getLastNDays(days);
  const completionDates = new Set(completions.map((c) => c.completedDate));

  // Filter days that are on or after habit start date
  const eligibleDays = lastNDays.filter(
    (date) => compareDates(date, habit.startDate) >= 0
  );

  if (eligibleDays.length === 0) return 0;

  // Count completed days
  const completedCount = eligibleDays.filter((date) =>
    completionDates.has(date)
  ).length;

  return Math.round((completedCount / eligibleDays.length) * 100);
}

/**
 * Check if habit is completed today
 */
export function isHabitCompletedToday(completions: HabitCompletion[]): boolean {
  const today = getTodayString();
  return completions.some((c) => c.completedDate === today);
}

/**
 * Check if habit is due today based on frequency
 */
export function isHabitDueToday(habit: Habit): boolean {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday

  if (habit.frequency === "daily") {
    return true;
  }

  if (habit.frequency === "weekly") {
    // Default to Monday (1) for weekly habits
    return dayOfWeek === 1;
  }

  if (habit.frequency === "custom" && habit.customDays) {
    return habit.customDays.includes(dayOfWeek);
  }

  return false;
}

/**
 * Enhance habit with computed stats
 */
export function enhanceHabitWithStats(
  habit: Habit,
  completions: HabitCompletion[]
): HabitWithStats {
  const currentStreak = calculateStreak(completions);
  const longestStreak = calculateLongestStreak(completions);
  const completionRate7Days = calculateCompletionRate(completions, habit, 7);
  const completionRate30Days = calculateCompletionRate(completions, habit, 30);
  const isCompletedToday = isHabitCompletedToday(completions);
  const totalCompletions = completions.length;

  return {
    ...habit,
    currentStreak,
    longestStreak,
    completionRate7Days,
    completionRate30Days,
    isCompletedToday,
    totalCompletions,
  };
}

/**
 * Generate a unique ID (simple version, InstantDB will handle this)
 */
export function generateId(): string {
  return crypto.randomUUID();
}
