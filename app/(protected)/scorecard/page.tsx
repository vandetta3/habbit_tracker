"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { db } from "@/lib/instant";
import { getTodayString, getLastNDays, formatDateForDisplay } from "@/lib/date-utils";
import { calculateStreak, isHabitCompletedToday } from "@/lib/habits";
import { Flame, TrendingUp, Target, Award } from "lucide-react";
import type { Habit, HabitCompletion } from "@/types";

export default function ScorecardPage() {
  const { user } = db.useAuth();
  const today = getTodayString();

  // Query habits and completions
  const { data, isLoading } = db.useQuery({
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

  const habits = (data?.habits || []) as unknown as (Habit & {
    completions: HabitCompletion[];
  })[];

  // Calculate today's score
  const totalHabits = habits.length;
  const completedToday = habits.filter((h) => isHabitCompletedToday(h.completions)).length;
  const todayScore = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  // Calculate weekly scores
  const last7Days = getLastNDays(7);
  const weeklyScores = last7Days.map((date) => {
    const dayCompletions = habits.filter((h) =>
      h.completions.some((c) => c.completedDate === date)
    ).length;
    const score = totalHabits > 0 ? Math.round((dayCompletions / totalHabits) * 100) : 0;
    return { date, score };
  });

  // Top 3 habits by streak
  const habitsWithStreaks = habits
    .map((h) => ({
      ...h,
      streak: calculateStreak(h.completions),
    }))
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 3);

  // Overall stats
  const totalCompletions = habits.reduce((sum, h) => sum + h.completions.length, 0);
  const avgScore = weeklyScores.length > 0
    ? Math.round(weeklyScores.reduce((sum, day) => sum + day.score, 0) / weeklyScores.length)
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scorecard</h1>
          <p className="text-muted-foreground">Loading your stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scorecard</h1>
        <p className="text-muted-foreground">
          Track your progress and performance
        </p>
      </div>

      {/* Today's Score */}
      <Card className="border-t-4 border-t-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Today's Score
          </CardTitle>
          <CardDescription>{formatDateForDisplay(today)}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-baseline gap-2">
            <span className="text-5xl font-bold">{todayScore}%</span>
            <span className="text-muted-foreground">
              ({completedToday}/{totalHabits} habits)
            </span>
          </div>
          <Progress value={todayScore} className="h-3" />
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">7-Day Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgScore}%</div>
            <p className="text-xs text-muted-foreground">
              Average completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Completions</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompletions}</div>
            <p className="text-xs text-muted-foreground">
              All-time habit completions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Habits</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHabits}</div>
            <p className="text-xs text-muted-foreground">
              Currently tracking
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress */}
      <Card>
        <CardHeader>
          <CardTitle>7-Day Progress</CardTitle>
          <CardDescription>Your daily completion rates for the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklyScores.map(({ date, score }) => {
              const isToday = date === today;
              const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
              
              return (
                <div key={date} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={isToday ? "font-bold" : ""}>
                        {dayName}
                      </span>
                      {isToday && (
                        <Badge variant="secondary" className="text-xs">Today</Badge>
                      )}
                    </div>
                    <span className="font-medium">{score}%</span>
                  </div>
                  <Progress value={score} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Streaks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Top Streaks
          </CardTitle>
          <CardDescription>Your habits with the longest current streaks</CardDescription>
        </CardHeader>
        <CardContent>
          {habitsWithStreaks.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              No habits yet. Create habits to start building streaks!
            </p>
          ) : (
            <div className="space-y-4">
              {habitsWithStreaks.map((habit, index) => (
                <div
                  key={habit.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold">
                      #{index + 1}
                    </div>
                    <span className="text-2xl">{habit.icon}</span>
                    <div>
                      <p className="font-medium">{habit.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {habit.completions.length} total completions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <span className="text-xl font-bold">{habit.streak}</span>
                    <span className="text-sm text-muted-foreground">days</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
