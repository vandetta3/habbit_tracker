// Core type definitions for the Habit Builder app

export type HabitFrequency = "daily" | "weekly" | "custom";
export type TodoStatus = "pending" | "done";
export type TodoPriority = "low" | "medium" | "high";
export type MilestoneType = "streak" | "total_completions" | "consistency" | "comeback" | "global";

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description?: string;
  frequency: HabitFrequency;
  customDays?: number[]; // 0-6 for Sun-Sat
  startDate: string; // YYYY-MM-DD
  isActive: boolean;
  color: string;
  icon: string;
  createdAt: number;
  updatedAt: number;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  userId: string;
  completedDate: string; // YYYY-MM-DD
  completedAt: number;
}

export interface Milestone {
  id: string;
  userId: string;
  habitId?: string | null;
  milestoneType: MilestoneType;
  milestoneKey: string;
  value: number;
  earnedAt: number;
  viewedAt?: number | null;
}

export interface Todo {
  id: string;
  userId: string;
  title: string;
  status: TodoStatus;
  dueDate?: string | null; // YYYY-MM-DD
  priority: TodoPriority;
  createdAt: number;
  completedAt?: number | null;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string; // Markdown
  tags?: string[];
  isPinned: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface DailyQuote {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  quote: string;
  author: string;
  fetchedAt: number;
}

export interface User {
  id: string;
  email: string;
  createdAt: number;
}

// Computed types
export interface HabitWithStats extends Habit {
  currentStreak: number;
  longestStreak: number;
  completionRate7Days: number;
  completionRate30Days: number;
  isCompletedToday: boolean;
  totalCompletions: number;
}

export interface MilestoneDefinition {
  key: string;
  value?: number;
  name: string;
  emoji: string;
  description: string;
}

export interface ScoreData {
  todayScore: number;
  completedToday: number;
  totalActiveToday: number;
  weeklyScores: { date: string; score: number }[];
}
