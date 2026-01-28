"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, CheckCircle2, Circle, Flame, TrendingUp } from "lucide-react";
import { db } from "@/lib/instant";
import { useToast } from "@/components/ui/toast";
import { getTodayString } from "@/lib/date-utils";
import { calculateStreak, calculateCompletionRate, isHabitCompletedToday } from "@/lib/habits";
import type { Habit, HabitCompletion } from "@/types";

export default function HabitsPage() {
  const { addToast } = useToast();
  const { user } = db.useAuth();

  // Query habits and completions
  const { data, isLoading } = db.useQuery({
    habits: {
      $: {
        where: {
          user: user?.id || "",
        },
      },
      completions: {},
    },
  });

  const habits = (data?.habits || []) as unknown as (Habit & {
    completions: HabitCompletion[];
  })[];

  const activeHabits = habits.filter((h) => h.isActive);
  const archivedHabits = habits.filter((h) => !h.isActive);

  const handleToggleCompletion = async (habit: Habit & { completions: HabitCompletion[] }) => {
    const today = getTodayString();
    const isCompleted = isHabitCompletedToday(habit.completions);

    try {
      if (isCompleted) {
        // Find and delete today's completion
        const todayCompletion = habit.completions.find((c) => c.completedDate === today);
        if (todayCompletion) {
          await db.transact([db.tx.habitCompletions[todayCompletion.id].delete()]);
          addToast("Completion removed", "info");
        }
      } else {
        // Create new completion
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Habits</h1>
            <p className="text-muted-foreground">Loading your habits...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Habits</h1>
          <p className="text-muted-foreground">
            Manage and track your daily habits
          </p>
        </div>
        <Link href="/habits/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Habit
          </Button>
        </Link>
      </div>

      {habits.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 text-6xl">🎯</div>
            <h3 className="mb-2 text-lg font-semibold">No habits yet</h3>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Create your first habit to start building consistency and tracking your progress.
            </p>
            <Link href="/habits/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Habit
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Active Habits */}
          {activeHabits.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Active Habits ({activeHabits.length})</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {activeHabits.map((habit) => {
                  const currentStreak = calculateStreak(habit.completions);
                  const completionRate7 = calculateCompletionRate(habit.completions, habit, 7);
                  const isCompleted = isHabitCompletedToday(habit.completions);
                  const totalCompletions = habit.completions.length;

                  return (
                    <Card key={habit.id} className="overflow-hidden">
                      <div
                        className="h-2"
                        style={{ backgroundColor: habit.color }}
                      />
                      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                        <div className="flex items-start gap-3">
                          <div className="text-3xl">{habit.icon}</div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{habit.title}</CardTitle>
                            {habit.description && (
                              <p className="mt-1 text-sm text-muted-foreground">
                                {habit.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleCompletion(habit)}
                          className="ml-2"
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                          ) : (
                            <Circle className="h-8 w-8 text-muted-foreground hover:text-primary" />
                          )}
                        </button>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Flame className="h-4 w-4 text-orange-500" />
                            <span className="font-medium">{currentStreak} day streak</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">{completionRate7}% (7d)</span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>7-day completion rate</span>
                            <span>{completionRate7}%</span>
                          </div>
                          <Progress value={completionRate7} />
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {habit.frequency}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {totalCompletions} completions
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Archived Habits */}
          {archivedHabits.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-muted-foreground">
                Archived ({archivedHabits.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {archivedHabits.map((habit) => {
                  const totalCompletions = habit.completions.length;

                  return (
                    <Card key={habit.id} className="opacity-60">
                      <CardHeader>
                        <div className="flex items-start gap-3">
                          <div className="text-3xl">{habit.icon}</div>
                          <div>
                            <CardTitle className="text-lg">{habit.title}</CardTitle>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {totalCompletions} total completions
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
