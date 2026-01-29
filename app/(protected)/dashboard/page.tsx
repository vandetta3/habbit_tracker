"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Plus, ArrowRight } from "lucide-react";
import { db } from "@/lib/instant";
import { useToast } from "@/components/ui/toast";
import { getTodayString, formatDateForDisplay } from "@/lib/date-utils";
import { calculateStreak, isHabitCompletedToday } from "@/lib/habits";
import { getRandomStaticQuote } from "@/lib/quotes";
import type { Habit, HabitCompletion, Expense } from "@/types";
import { formatCurrency } from "@/lib/expenses";
import { EXPENSE_CATEGORIES } from "@/lib/constants";

export default function DashboardPage() {
  const { addToast } = useToast();
  const { user } = db.useAuth();
  const [quote, setQuote] = useState(getRandomStaticQuote());
  const today = getTodayString();

  // Query habits and completions
  const { data: habitsData } = db.useQuery({
    habits: {
      $: {
        where: {
          user: user?.id || "",
          isActive: true,
        },
      },
      completions: {},
    },
  });

  const habits = (habitsData?.habits || []) as unknown as (Habit & {
    completions: HabitCompletion[];
  })[];

  // Query recent expenses
  const { data: expensesData } = db.useQuery({
    expenses: {
      $: {
        where: {
          user: user?.id || "",
        },
      },
    },
  });

  const allExpenses = (expensesData?.expenses || []) as unknown as Expense[];
  const expenses = allExpenses
    .filter((e) => !e.deletedAt)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  const getCategoryIcon = (category: string): string => {
    const cat = EXPENSE_CATEGORIES.find((c) => c.value === category);
    return cat?.icon || "📦";
  };

  // Calculate stats
  const totalHabits = habits.length;
  const completedToday = habits.filter((h) => isHabitCompletedToday(h.completions)).length;
  const todayScore = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  
  const maxStreak = habits.reduce((max, habit) => {
    const streak = calculateStreak(habit.completions);
    return Math.max(max, streak);
  }, 0);

  const totalCompletions = habits.reduce((sum, habit) => {
    return sum + habit.completions.length;
  }, 0);

  const handleToggleCompletion = async (habit: Habit & { completions: HabitCompletion[] }) => {
    const isCompleted = isHabitCompletedToday(habit.completions);

    try {
      if (isCompleted) {
        const todayCompletion = habit.completions.find((c) => c.completedDate === today);
        if (todayCompletion) {
          await db.transact([db.tx.habitCompletions[todayCompletion.id].delete()]);
          addToast("Completion removed", "info");
        }
      } else {
        await db.transact([
          db.tx.habitCompletions[crypto.randomUUID()]
            .update({
              completedDate: today,
              completedAt: Date.now(),
            })
            .link({ habit: habit.id, user: user!.id }),
        ]);
        addToast("Habit completed! 🎉", "success");
      }
    } catch (error) {
      console.error("Error toggling completion:", error);
      addToast("Failed to update habit. Please try again.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back! 👋
        </h1>
        <p className="text-muted-foreground">
          {formatDateForDisplay(today)}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Score</CardTitle>
            <span className="text-2xl">📊</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayScore}%</div>
            <p className="text-xs text-muted-foreground">
              {completedToday} of {totalHabits} habits completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Habits</CardTitle>
            <span className="text-2xl">🎯</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHabits}</div>
            <p className="text-xs text-muted-foreground">
              {totalHabits === 0 ? "Start by creating your first habit" : "Habits being tracked"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Streak</CardTitle>
            <span className="text-2xl">🔥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maxStreak} days</div>
            <p className="text-xs text-muted-foreground">
              {maxStreak === 0 ? "Complete habits to build streaks" : "Current longest streak"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Completions</CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompletions}</div>
            <p className="text-xs text-muted-foreground">
              {totalCompletions === 0 ? "Complete habits to track progress" : "All-time completions"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quote of the Day */}
      <Card className="border-l-4 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💬 Quote of the Day
          </CardTitle>
        </CardHeader>
        <CardContent>
          <blockquote className="text-lg italic">
            "{quote.quote}"
          </blockquote>
          <p className="mt-2 text-sm text-muted-foreground">— {quote.author}</p>
        </CardContent>
      </Card>

      {/* Today's Habits */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Today's Habits</CardTitle>
          <Link href="/habits">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {habits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-2 text-4xl">🎯</div>
              <p className="mb-4 text-sm text-muted-foreground">
                No habits yet. Create your first habit to get started!
              </p>
              <Link href="/habits/new">
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Habit
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {habits.slice(0, 5).map((habit) => {
                const isCompleted = isHabitCompletedToday(habit.completions);
                const currentStreak = calculateStreak(habit.completions);

                return (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleCompletion(habit)}
                        className="transition-transform hover:scale-110"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-6 w-6 text-green-500" />
                        ) : (
                          <Circle className="h-6 w-6 text-muted-foreground" />
                        )}
                      </button>
                      <span className="text-2xl">{habit.icon}</span>
                      <div>
                        <p className="font-medium">{habit.title}</p>
                        {currentStreak > 0 && (
                          <p className="text-xs text-muted-foreground">
                            🔥 {currentStreak} day streak
                          </p>
                        )}
                      </div>
                    </div>
                    <div
                      className="h-10 w-1 rounded-full"
                      style={{ backgroundColor: habit.color }}
                    />
                  </div>
                );
              })}
              {habits.length > 5 && (
                <Link href="/habits">
                  <Button variant="ghost" size="sm" className="w-full">
                    View {habits.length - 5} more habits
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Expenses</CardTitle>
          <Link href="/expenses">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-2 text-4xl">💰</div>
              <p className="mb-4 text-sm text-muted-foreground">
                No expenses yet. Start tracking your spending!
              </p>
              <Link href="/expenses/new">
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <Link key={expense.id} href="/expenses">
                  <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getCategoryIcon(expense.category)}</span>
                      <div>
                        <p className="font-medium">{expense.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {expense.category} • {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(expense.amount)}</p>
                      {expense.wasteFlag && (
                        <Badge variant="destructive" className="text-xs">
                          Waste
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
              {allExpenses.filter((e) => !e.deletedAt).length > 5 && (
                <Link href="/expenses">
                  <Button variant="ghost" size="sm" className="w-full">
                    View {allExpenses.filter((e) => !e.deletedAt).length - 5} more expenses
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/habits">
          <Card className="cursor-pointer transition-colors hover:bg-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                🎯 Habits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage and track your habits
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/todos">
          <Card className="cursor-pointer transition-colors hover:bg-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                ✅ Todos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage your tasks and to-dos
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/expenses">
          <Card className="cursor-pointer transition-colors hover:bg-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                💰 Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track and analyze your spending
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
