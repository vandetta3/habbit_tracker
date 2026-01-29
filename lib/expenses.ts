import { Expense, ExpenseCategory, SpendingHealthMetrics, CategorySpend, ExpenseInsight, MonthComparison, WeekdayWeekendComparison } from "@/types";
import { getTodayString, getLastNDays } from "./date-utils";

/**
 * Format amount in paise to INR display format
 */
export function formatCurrency(amountInPaise: number): string {
  const amount = amountInPaise / 100;
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Convert INR to paise for storage
 */
export function convertToPaise(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert paise to INR for display
 */
export function convertToINR(amountInPaise: number): number {
  return amountInPaise / 100;
}

/**
 * Calculate total spend for a given period
 */
export function calculateTotalSpend(
  expenses: Expense[],
  period: "day" | "week" | "month" | "all" = "all"
): number {
  const today = getTodayString();
  let filteredExpenses = expenses;

  if (period === "day") {
    filteredExpenses = expenses.filter((e) => e.date === today);
  } else if (period === "week") {
    const last7Days = getLastNDays(7);
    filteredExpenses = expenses.filter((e) => last7Days.includes(e.date));
  } else if (period === "month") {
    const last30Days = getLastNDays(30);
    filteredExpenses = expenses.filter((e) => last30Days.includes(e.date));
  }

  return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
}

/**
 * Calculate necessary vs non-necessary spending
 */
export function calculateNecessaryVsNonNecessary(expenses: Expense[]): {
  necessary: number;
  nonNecessary: number;
  necessaryPercentage: number;
} {
  const necessary = expenses
    .filter((e) => e.necessityLevel === "necessary")
    .reduce((sum, e) => sum + e.amount, 0);

  const nonNecessary = expenses
    .filter((e) => e.necessityLevel !== "necessary")
    .reduce((sum, e) => sum + e.amount, 0);

  const total = necessary + nonNecessary;
  const necessaryPercentage = total > 0 ? Math.round((necessary / total) * 100) : 0;

  return { necessary, nonNecessary, necessaryPercentage };
}

/**
 * Calculate wasteful spending
 */
export function calculateWastefulSpend(expenses: Expense[]): {
  amount: number;
  percentage: number;
  count: number;
} {
  const wastefulExpenses = expenses.filter((e) => e.wasteFlag);
  const amount = wastefulExpenses.reduce((sum, e) => sum + e.amount, 0);
  const total = calculateTotalSpend(expenses);
  const percentage = total > 0 ? Math.round((amount / total) * 100) : 0;

  return { amount, percentage, count: wastefulExpenses.length };
}

/**
 * Calculate savings opportunity based on savings potential
 */
export function calculateSavingsOpportunity(expenses: Expense[]): number {
  return expenses.reduce((sum, expense) => {
    let potentialSavings = 0;
    
    switch (expense.savingsPotential) {
      case "low":
        potentialSavings = expense.amount * 0.1; // 10%
        break;
      case "medium":
        potentialSavings = expense.amount * 0.2; // 20%
        break;
      case "high":
        potentialSavings = expense.amount * 0.35; // 35%
        break;
      default:
        potentialSavings = 0;
    }
    
    return sum + potentialSavings;
  }, 0);
}

/**
 * Get spending health metrics
 */
export function getSpendingHealthMetrics(expenses: Expense[]): SpendingHealthMetrics {
  const totalSpend = calculateTotalSpend(expenses);
  const { necessary, nonNecessary, necessaryPercentage } = calculateNecessaryVsNonNecessary(expenses);
  const { amount: wastefulSpend, percentage: wastefulPercentage } = calculateWastefulSpend(expenses);
  const savingsOpportunity = calculateSavingsOpportunity(expenses);
  
  const last30Days = getLastNDays(30);
  const expensesLast30Days = expenses.filter((e) => last30Days.includes(e.date));
  const avgDailySpend = expensesLast30Days.length > 0 
    ? calculateTotalSpend(expensesLast30Days) / 30 
    : 0;

  return {
    totalSpend,
    necessarySpend: necessary,
    nonNecessarySpend: nonNecessary,
    necessaryPercentage,
    wastefulSpend,
    wastefulPercentage,
    savingsOpportunity,
    avgDailySpend,
  };
}

/**
 * Get top waste categories
 */
export function getTopWasteCategories(expenses: Expense[], limit = 5): CategorySpend[] {
  const wastefulExpenses = expenses.filter((e) => e.wasteFlag);
  
  const categoryMap = new Map<ExpenseCategory, { total: number; count: number }>();
  
  wastefulExpenses.forEach((expense) => {
    const existing = categoryMap.get(expense.category) || { total: 0, count: 0 };
    categoryMap.set(expense.category, {
      total: existing.total + expense.amount,
      count: existing.count + 1,
    });
  });

  const totalWaste = wastefulExpenses.reduce((sum, e) => sum + e.amount, 0);

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      percentage: totalWaste > 0 ? Math.round((data.total / totalWaste) * 100) : 0,
      trend: "stable" as const,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

/**
 * Get impulse spending trend over days
 */
export function getImpulseSpendingTrend(expenses: Expense[], days = 30): { date: string; amount: number }[] {
  const lastNDays = getLastNDays(days);
  const impulseExpenses = expenses.filter((e) => e.emotionTag === "impulse");

  return lastNDays.map((date) => {
    const dayImpulseExpenses = impulseExpenses.filter((e) => e.date === date);
    const amount = dayImpulseExpenses.reduce((sum, e) => sum + e.amount, 0);
    return { date, amount };
  });
}

/**
 * Get emotion-driven expenses breakdown
 */
export function getEmotionDrivenExpenses(expenses: Expense[]): Record<string, { count: number; total: number }> {
  const emotionMap: Record<string, { count: number; total: number }> = {
    neutral: { count: 0, total: 0 },
    happy: { count: 0, total: 0 },
    stress: { count: 0, total: 0 },
    impulse: { count: 0, total: 0 },
    celebration: { count: 0, total: 0 },
    regret: { count: 0, total: 0 },
  };

  expenses.forEach((expense) => {
    if (emotionMap[expense.emotionTag]) {
      emotionMap[expense.emotionTag].count++;
      emotionMap[expense.emotionTag].total += expense.amount;
    }
  });

  return emotionMap;
}

/**
 * Get high regret expenses
 */
export function getHighRegretExpenses(expenses: Expense[]): Expense[] {
  return expenses
    .filter((e) => e.emotionTag === "regret")
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);
}

/**
 * Get spending by category
 */
export function getSpendByCategory(expenses: Expense[]): CategorySpend[] {
  const categoryMap = new Map<ExpenseCategory, { total: number; count: number }>();
  
  expenses.forEach((expense) => {
    const existing = categoryMap.get(expense.category) || { total: 0, count: 0 };
    categoryMap.set(expense.category, {
      total: existing.total + expense.amount,
      count: existing.count + 1,
    });
  });

  const totalSpend = calculateTotalSpend(expenses);

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      percentage: totalSpend > 0 ? Math.round((data.total / totalSpend) * 100) : 0,
      trend: "stable" as const,
    }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Compare current month with previous month
 */
export function compareMonths(expenses: Expense[]): MonthComparison {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const currentMonthExpenses = expenses.filter((e) => {
    const expenseDate = new Date(e.date);
    return expenseDate.getFullYear() === currentYear && expenseDate.getMonth() + 1 === currentMonth;
  });

  const previousMonthExpenses = expenses.filter((e) => {
    const expenseDate = new Date(e.date);
    return expenseDate.getFullYear() === previousYear && expenseDate.getMonth() + 1 === previousMonth;
  });

  const currentTotal = calculateTotalSpend(currentMonthExpenses);
  const previousTotal = calculateTotalSpend(previousMonthExpenses);

  const percentageChange = previousTotal > 0 
    ? Math.round(((currentTotal - previousTotal) / previousTotal) * 100) 
    : 0;

  return {
    currentMonth: {
      total: currentTotal,
      necessary: calculateNecessaryVsNonNecessary(currentMonthExpenses).necessary,
      wasteful: calculateWastefulSpend(currentMonthExpenses).amount,
    },
    previousMonth: {
      total: previousTotal,
      necessary: calculateNecessaryVsNonNecessary(previousMonthExpenses).necessary,
      wasteful: calculateWastefulSpend(previousMonthExpenses).amount,
    },
    percentageChange,
  };
}

/**
 * Compare weekday vs weekend spending
 */
export function compareWeekdayVsWeekend(expenses: Expense[]): WeekdayWeekendComparison {
  const weekdayExpenses = expenses.filter((e) => {
    const dayOfWeek = new Date(e.date).getDay();
    return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
  });

  const weekendExpenses = expenses.filter((e) => {
    const dayOfWeek = new Date(e.date).getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
  });

  const weekdayTotal = calculateTotalSpend(weekdayExpenses);
  const weekendTotal = calculateTotalSpend(weekendExpenses);

  return {
    weekday: {
      total: weekdayTotal,
      count: weekdayExpenses.length,
      average: weekdayExpenses.length > 0 ? weekdayTotal / weekdayExpenses.length : 0,
    },
    weekend: {
      total: weekendTotal,
      count: weekendExpenses.length,
      average: weekendExpenses.length > 0 ? weekendTotal / weekendExpenses.length : 0,
    },
  };
}

/**
 * Generate actionable insights from expenses
 */
export function generateInsights(expenses: Expense[]): ExpenseInsight[] {
  const insights: ExpenseInsight[] = [];
  
  if (expenses.length === 0) {
    return insights;
  }

  const last30Days = getLastNDays(30);
  const recentExpenses = expenses.filter((e) => last30Days.includes(e.date));

  // Wasteful spending insight
  const { percentage: wastefulPercentage, count: wastefulCount } = calculateWastefulSpend(recentExpenses);
  if (wastefulPercentage > 15) {
    insights.push({
      type: "warning",
      message: `${wastefulPercentage}% of your expenses (${wastefulCount} items) were marked as wasteful in the last 30 days.`,
    });
  } else if (wastefulPercentage < 5) {
    insights.push({
      type: "success",
      message: `Great job! Only ${wastefulPercentage}% of your spending was wasteful this month.`,
    });
  }

  // Avoidable expenses insight
  const avoidableExpenses = recentExpenses.filter((e) => e.necessityLevel === "avoidable");
  if (avoidableExpenses.length > 0) {
    const avoidableAmount = avoidableExpenses.reduce((sum, e) => sum + e.amount, 0);
    const avoidablePercentage = Math.round((avoidableAmount / calculateTotalSpend(recentExpenses)) * 100);
    insights.push({
      type: "info",
      message: `${avoidablePercentage}% of your expenses (${formatCurrency(avoidableAmount)}) were marked as avoidable last month.`,
    });
  }

  // Impulse spending insight
  const impulseExpenses = recentExpenses.filter((e) => e.emotionTag === "impulse");
  if (impulseExpenses.length > 5) {
    const impulseTotal = impulseExpenses.reduce((sum, e) => sum + e.amount, 0);
    insights.push({
      type: "warning",
      message: `You made ${impulseExpenses.length} impulse purchases totaling ${formatCurrency(impulseTotal)} this month.`,
    });
  }

  // Stress spending insight
  const stressExpenses = recentExpenses.filter((e) => e.emotionTag === "stress");
  if (stressExpenses.length > 3) {
    insights.push({
      type: "info",
      message: `Noticed ${stressExpenses.length} stress-related purchases. Consider healthier coping mechanisms.`,
    });
  }

  // Savings opportunity insight
  const savingsOpportunity = calculateSavingsOpportunity(recentExpenses);
  if (savingsOpportunity > 0) {
    insights.push({
      type: "info",
      message: `You could potentially save ${formatCurrency(savingsOpportunity)} per month by optimizing your spending.`,
    });
  }

  // Top waste category
  const topWasteCategories = getTopWasteCategories(recentExpenses, 1);
  if (topWasteCategories.length > 0) {
    const topCategory = topWasteCategories[0];
    insights.push({
      type: "warning",
      message: `${topCategory.category} is your top wasteful spending category at ${formatCurrency(topCategory.total)}.`,
      category: topCategory.category,
    });
  }

  return insights;
}

/**
 * Group expenses by date
 */
export function groupExpensesByDate(expenses: Expense[]): Map<string, Expense[]> {
  const grouped = new Map<string, Expense[]>();
  
  expenses.forEach((expense) => {
    const existing = grouped.get(expense.date) || [];
    grouped.set(expense.date, [...existing, expense]);
  });

  return grouped;
}

/**
 * Filter expenses by date range
 */
export function filterExpensesByDateRange(
  expenses: Expense[],
  startDate: string,
  endDate: string
): Expense[] {
  return expenses.filter((e) => e.date >= startDate && e.date <= endDate);
}

/**
 * Get payment mode breakdown
 */
export function getPaymentModeBreakdown(expenses: Expense[]): Record<string, { count: number; total: number }> {
  const breakdown: Record<string, { count: number; total: number }> = {
    Cash: { count: 0, total: 0 },
    Card: { count: 0, total: 0 },
    UPI: { count: 0, total: 0 },
    Wallet: { count: 0, total: 0 },
  };

  expenses.forEach((expense) => {
    if (breakdown[expense.paymentMode]) {
      breakdown[expense.paymentMode].count++;
      breakdown[expense.paymentMode].total += expense.amount;
    }
  });

  return breakdown;
}
