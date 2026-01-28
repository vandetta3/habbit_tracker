"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/instant";
import { STREAK_MILESTONES, COMPLETION_MILESTONES, CONSISTENCY_MILESTONES } from "@/lib/constants";
import { calculateStreak } from "@/lib/habits";
import { Trophy, Lock, CheckCircle2 } from "lucide-react";
import type { Habit, HabitCompletion, Milestone } from "@/types";

export default function AchievementsPage() {
  const { user } = db.useAuth();

  // Query habits, completions, and milestones
  const { data, isLoading } = db.useQuery({
    habits: {
      $: {
        where: {
          user: user?.id || "",
        },
      },
      completions: {},
      milestones: {},
    },
  });

  const habits = (data?.habits || []) as unknown as (Habit & {
    completions: HabitCompletion[];
    milestones: Milestone[];
  })[];

  // Collect all earned milestones
  const earnedMilestones = new Set<string>();
  habits.forEach((habit) => {
    habit.milestones?.forEach((m) => {
      earnedMilestones.add(m.milestoneKey);
    });
  });

  // Calculate progress for each habit
  const habitsWithProgress = habits.map((habit) => ({
    ...habit,
    currentStreak: calculateStreak(habit.completions),
    totalCompletions: habit.completions.length,
  }));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
          <p className="text-muted-foreground">Loading your achievements...</p>
        </div>
      </div>
    );
  }

  const totalEarned = earnedMilestones.size;
  const totalAvailable =
    STREAK_MILESTONES.length + COMPLETION_MILESTONES.length + CONSISTENCY_MILESTONES.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
        <p className="text-muted-foreground">
          Track your milestones and celebrate your progress
        </p>
      </div>

      {/* Summary */}
      <Card className="border-t-4 border-t-yellow-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Your Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{totalEarned}</span>
            <span className="text-muted-foreground">
              / {totalAvailable} milestones earned
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Streak Milestones */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">🔥 Streak Milestones</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {STREAK_MILESTONES.map((milestone) => {
            const isEarned = earnedMilestones.has(milestone.key);
            const bestStreak = Math.max(
              ...habitsWithProgress.map((h) => h.currentStreak),
              0
            );
            const progress = bestStreak >= milestone.value ? 100 : Math.round((bestStreak / milestone.value) * 100);

            return (
              <Card
                key={milestone.key}
                className={isEarned ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20" : "opacity-60"}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="text-4xl">{milestone.emoji}</div>
                    {isEarned ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <CardTitle className="text-lg">{milestone.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {milestone.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant={isEarned ? "default" : "secondary"} className="text-xs">
                      {milestone.value} days
                    </Badge>
                    {!isEarned && bestStreak > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {progress}% progress
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Completion Milestones */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">💯 Completion Milestones</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {COMPLETION_MILESTONES.map((milestone) => {
            const isEarned = earnedMilestones.has(milestone.key);
            const maxCompletions = Math.max(
              ...habitsWithProgress.map((h) => h.totalCompletions),
              0
            );
            const progress = maxCompletions >= milestone.value ? 100 : Math.round((maxCompletions / milestone.value) * 100);

            return (
              <Card
                key={milestone.key}
                className={isEarned ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" : "opacity-60"}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="text-4xl">{milestone.emoji}</div>
                    {isEarned ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <CardTitle className="text-lg">{milestone.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {milestone.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant={isEarned ? "default" : "secondary"} className="text-xs">
                      {milestone.value} completions
                    </Badge>
                    {!isEarned && maxCompletions > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {progress}% progress
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Consistency Milestones */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">✨ Consistency Milestones</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CONSISTENCY_MILESTONES.map((milestone) => {
            const isEarned = earnedMilestones.has(milestone.key);

            return (
              <Card
                key={milestone.key}
                className={isEarned ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20" : "opacity-60"}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="text-4xl">{milestone.emoji}</div>
                    {isEarned ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <CardTitle className="text-lg">{milestone.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {milestone.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
