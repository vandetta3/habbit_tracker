import { HabitCompletion, Milestone, MilestoneDefinition } from "@/types";
import { 
  STREAK_MILESTONES, 
  COMPLETION_MILESTONES, 
  CONSISTENCY_MILESTONES,
  GLOBAL_MILESTONES 
} from "./constants";
import { calculateStreak } from "./habits";

/**
 * Check which streak milestones have been reached
 */
export function checkStreakMilestones(
  currentStreak: number,
  existingMilestones: Milestone[]
): MilestoneDefinition[] {
  const earnedKeys = new Set(
    existingMilestones
      .filter((m) => m.milestoneType === "streak")
      .map((m) => m.milestoneKey)
  );

  const newMilestones: MilestoneDefinition[] = [];

  for (const milestone of STREAK_MILESTONES) {
    if (currentStreak >= milestone.value && !earnedKeys.has(milestone.key)) {
      newMilestones.push(milestone);
    }
  }

  return newMilestones;
}

/**
 * Check which completion milestones have been reached
 */
export function checkCompletionMilestones(
  totalCompletions: number,
  existingMilestones: Milestone[]
): MilestoneDefinition[] {
  const earnedKeys = new Set(
    existingMilestones
      .filter((m) => m.milestoneType === "total_completions")
      .map((m) => m.milestoneKey)
  );

  const newMilestones: MilestoneDefinition[] = [];

  for (const milestone of COMPLETION_MILESTONES) {
    if (totalCompletions >= milestone.value && !earnedKeys.has(milestone.key)) {
      newMilestones.push(milestone);
    }
  }

  return newMilestones;
}

/**
 * Check for perfect week milestone
 */
export function checkPerfectWeek(
  allCompletions: HabitCompletion[],
  activeHabitIds: string[],
  existingMilestones: Milestone[]
): MilestoneDefinition | null {
  const earnedKeys = new Set(existingMilestones.map((m) => m.milestoneKey));

  if (earnedKeys.has("perfect_week")) {
    return null; // Already earned
  }

  // Check if all active habits were completed for the last 7 days
  const last7Days = getLast7DaysSet();
  const completionsByDay = groupCompletionsByDay(allCompletions);

  for (const day of last7Days) {
    const dayCompletions = completionsByDay.get(day) || new Set();
    
    // Check if all active habits were completed on this day
    for (const habitId of activeHabitIds) {
      if (!dayCompletions.has(habitId)) {
        return null; // Not a perfect week
      }
    }
  }

  const perfectWeek = CONSISTENCY_MILESTONES.find((m) => m.key === "perfect_week");
  return perfectWeek || null;
}

/**
 * Check for comeback milestone (return after 30+ day break)
 */
export function checkComeback(
  completions: HabitCompletion[],
  existingMilestones: Milestone[]
): MilestoneDefinition | null {
  const earnedKeys = new Set(existingMilestones.map((m) => m.milestoneKey));

  if (earnedKeys.has("comeback")) {
    return null; // Already earned
  }

  if (completions.length < 8) {
    return null; // Need at least 8 completions to check
  }

  // Sort by date
  const sorted = [...completions].sort((a, b) =>
    a.completedDate.localeCompare(b.completedDate)
  );

  // Check for a gap of 30+ days followed by 7 consecutive days
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].completedDate);
    const curr = new Date(sorted[i].completedDate);
    const daysDiff = Math.floor(
      (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff >= 30) {
      // Found a gap, check if there are 7 consecutive days after
      const afterGap = sorted.slice(i);
      const streak = calculateStreak(afterGap, false);
      
      if (streak >= 7) {
        const comeback = CONSISTENCY_MILESTONES.find((m) => m.key === "comeback");
        return comeback || null;
      }
    }
  }

  return null;
}

/**
 * Get next milestone for a habit
 */
export function getNextStreakMilestone(currentStreak: number): MilestoneDefinition | null {
  for (const milestone of STREAK_MILESTONES) {
    if (currentStreak < milestone.value) {
      return milestone;
    }
  }
  return null; // Already at max
}

/**
 * Get next completion milestone
 */
export function getNextCompletionMilestone(totalCompletions: number): MilestoneDefinition | null {
  for (const milestone of COMPLETION_MILESTONES) {
    if (totalCompletions < milestone.value) {
      return milestone;
    }
  }
  return null; // Already at max
}

/**
 * Calculate progress to next milestone (0-100)
 */
export function calculateMilestoneProgress(
  current: number,
  next: MilestoneDefinition | null,
  prev: MilestoneDefinition | null
): number {
  if (!next) return 100; // Already at max

  const prevValue = prev?.value || 0;
  const nextValue = next.value;
  const range = nextValue - prevValue;

  if (range === 0) return 100;

  const progress = ((current - prevValue) / range) * 100;
  return Math.min(100, Math.max(0, progress));
}

// Helper functions
function getLast7DaysSet(): Set<string> {
  const days = new Set<string>();
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.add(date.toISOString().split("T")[0]);
  }
  
  return days;
}

function groupCompletionsByDay(
  completions: HabitCompletion[]
): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  
  for (const completion of completions) {
    if (!map.has(completion.completedDate)) {
      map.set(completion.completedDate, new Set());
    }
    map.get(completion.completedDate)!.add(completion.habitId);
  }
  
  return map;
}
