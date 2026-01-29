// Core type definitions for the Daily Stack app

export type HabitFrequency = "daily" | "weekly" | "custom";
export type TodoStatus = "pending" | "done";
export type TodoPriority = "low" | "medium" | "high";

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description?: string;
  frequency: HabitFrequency;
  customDays?: number[]; // 0-6 for Sun-Sat
  startDate: string; // YYYY-MM-DD
  when?: string; // Time in 24hr format (HH:MM)
  where?: string; // Location/place
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

export type MilestoneType = "streak" | "total_completions" | "consistency" | "global";

export interface MilestoneDefinition {
  key: string;
  type: MilestoneType;
  value: number;
  title: string;
  description: string;
  icon: string;
}

export interface Milestone {
  id: string;
  userId: string;
  habitId?: string;
  milestoneKey: string;
  milestoneType: MilestoneType;
  earnedAt: number;
  createdAt: number;
}

export interface Todo {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: TodoStatus;
  dueDate?: string | null; // YYYY-MM-DD
  dueTime?: string | null; // HH:MM in 24hr format
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

export interface ScoreData {
  todayScore: number;
  completedToday: number;
  totalActiveToday: number;
  weeklyScores: { date: string; score: number }[];
}

// Expense types
export type ExpenseCategory = 
  | "Food & Dining"
  | "Groceries"
  | "Transport"
  | "Shopping"
  | "Entertainment"
  | "Bills & Utilities"
  | "Healthcare"
  | "Education"
  | "Travel"
  | "Personal Care"
  | "Gifts"
  | "Investments"
  | "Other";

export type PaymentMode = "Cash" | "Card" | "UPI" | "Wallet";

export type NecessityLevel = "necessary" | "avoidable" | "optional" | "luxury";

export type SavingsPotential = "none" | "low" | "medium" | "high";

export type EmotionTag = "neutral" | "happy" | "stress" | "impulse" | "celebration" | "regret";

export type ExpenseIntent = "survival" | "comfort" | "growth" | "social" | "entertainment" | "status";

export type RecurringType = "monthly" | "yearly";

export interface Expense {
  id: string;
  userId: string;
  title: string;
  amount: number; // Stored in paise/cents
  currency: string; // 'INR'
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  paymentMode: PaymentMode;
  merchant?: string;
  notes?: string;
  // Behavioral tracking
  necessityLevel: NecessityLevel;
  savingsPotential: SavingsPotential;
  wasteFlag: boolean;
  valueScore: number; // 1-5
  emotionTag: EmotionTag;
  expenseIntent: ExpenseIntent;
  // Lifecycle
  isRecurring: boolean;
  recurringType?: RecurringType;
  deletedAt?: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface ExpenseWithAnalytics extends Expense {
  // Computed fields for analytics
  isWasteful: boolean;
  potentialSavings: number;
  categoryPercentage: number;
}

// Analytics types
export interface SpendingHealthMetrics {
  totalSpend: number;
  necessarySpend: number;
  nonNecessarySpend: number;
  necessaryPercentage: number;
  wastefulSpend: number;
  wastefulPercentage: number;
  savingsOpportunity: number;
  avgDailySpend: number;
}

export interface CategorySpend {
  category: ExpenseCategory;
  total: number;
  count: number;
  percentage: number;
  trend: "up" | "down" | "stable";
}

export interface ExpenseInsight {
  type: "warning" | "info" | "success";
  message: string;
  category?: ExpenseCategory;
}

export interface MonthComparison {
  currentMonth: {
    total: number;
    necessary: number;
    wasteful: number;
  };
  previousMonth: {
    total: number;
    necessary: number;
    wasteful: number;
  };
  percentageChange: number;
}

export interface WeekdayWeekendComparison {
  weekday: {
    total: number;
    count: number;
    average: number;
  };
  weekend: {
    total: number;
    count: number;
    average: number;
  };
}
