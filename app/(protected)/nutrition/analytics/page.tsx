"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Camera } from "lucide-react";
import { db } from "@/lib/instant";
import { TimeRangeSelector } from "@/components/nutrition/TimeRangeSelector";
import { WeightChart } from "@/components/nutrition/WeightChart";
import { CalorieChart } from "@/components/nutrition/CalorieChart";
import { ProteinChart } from "@/components/nutrition/ProteinChart";
import { MetricStatsCard } from "@/components/nutrition/MetricStatsCard";
import {
  filterEntriesByDateRange,
  calculateNutritionAnalytics,
  getWeightTrend,
} from "@/lib/nutrition";
import type { NutritionEntry, NutritionProfile, TimeRange } from "@/types";

export default function NutritionAnalyticsPage() {
  const { user } = db.useAuth();
  const [selectedRange, setSelectedRange] = useState<TimeRange>('month');
  const [customDates, setCustomDates] = useState<{ start: string; end: string }>();
  
  // Query nutrition entries
  const { data: entriesData, isLoading: entriesLoading } = db.useQuery({
    nutritionEntries: {
      $: {
        where: {
          user: user?.id || "",
        },
      },
    },
  });
  
  // Query nutrition profile
  const { data: profileData } = db.useQuery({
    nutritionProfiles: {
      $: {
        where: {
          user: user?.id || "",
        },
      },
    },
  });
  
  const allEntries = (entriesData?.nutritionEntries || []) as unknown as NutritionEntry[];
  const profile = (profileData?.nutritionProfiles?.[0] || null) as NutritionProfile | null;
  
  // Filter entries by selected time range
  const filteredEntries = filterEntriesByDateRange(allEntries, selectedRange, customDates);
  
  // Calculate analytics
  const analytics = calculateNutritionAnalytics(
    filteredEntries,
    profile ? {
      dailyCalorieTarget: profile.dailyCalorieTarget,
      dailyProteinTarget: profile.dailyProteinTarget,
    } : undefined
  );
  
  const weightTrend = getWeightTrend(filteredEntries);
  
  const handleRangeSelect = (range: TimeRange, dates?: { start: string; end: string }) => {
    setSelectedRange(range);
    if (range === 'custom' && dates) {
      setCustomDates(dates);
    }
  };
  
  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/nutrition">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nutrition Analytics</h1>
            <p className="text-muted-foreground">Track your progress and trends</p>
          </div>
        </div>
        <Link href="/nutrition/analytics/images">
          <Button>
            <Camera className="mr-2 h-4 w-4" />
            Image Analytics
          </Button>
        </Link>
      </div>
      
      {/* Time Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Time Period</CardTitle>
        </CardHeader>
        <CardContent>
          <TimeRangeSelector
            selected={selectedRange}
            onSelect={handleRangeSelect}
            customDates={customDates}
          />
        </CardContent>
      </Card>
      
      {entriesLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              Loading analytics...
            </div>
          </CardContent>
        </Card>
      ) : filteredEntries.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-4 text-6xl">📊</div>
              <h3 className="mb-2 text-lg font-semibold">No data for selected period</h3>
              <p className="mb-4 text-sm text-muted-foreground max-w-sm">
                Try selecting a different time range or add more entries
              </p>
              <Link href="/nutrition/new">
                <Button>Add Entry</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Overview */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Overview</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricStatsCard
                title="Weight Change"
                value={`${analytics.weightChange > 0 ? '+' : ''}${analytics.weightChange.toFixed(1)} kg`}
                subtitle={`${analytics.startWeight} → ${analytics.currentWeight} kg`}
                trend={weightTrend === 'gain' ? 'up' : weightTrend === 'loss' ? 'down' : 'neutral'}
                icon="⚖️"
                valueColor={
                  weightTrend === 'loss' ? 'text-green-600' :
                  weightTrend === 'gain' ? 'text-red-600' :
                  ''
                }
              />
              
              <MetricStatsCard
                title="Avg Calories"
                value={`${analytics.avgCalories} kcal`}
                subtitle={profile ? `Target: ${profile.dailyCalorieTarget} kcal` : 'Set target in settings'}
                icon="🔥"
              />
              
              <MetricStatsCard
                title="Avg Protein"
                value={`${analytics.avgProtein}g`}
                subtitle={profile ? `Target: ${profile.dailyProteinTarget}g` : 'Set target in settings'}
                icon="🥩"
              />
              
              <MetricStatsCard
                title="Weekly Avg Weight"
                value={`${analytics.weeklyAvgWeight} kg`}
                subtitle={`Based on ${filteredEntries.length} entries`}
                icon="📈"
              />
            </div>
          </div>
          
          {/* Additional Stats (if profile exists) */}
          {profile && (
            <div className="grid gap-4 md:grid-cols-2">
              <MetricStatsCard
                title="Calorie Adherence"
                value={`${analytics.calorieAdherence}%`}
                subtitle="Days within 10% of target"
                icon="🎯"
                valueColor={
                  analytics.calorieAdherence >= 80 ? 'text-green-600' :
                  analytics.calorieAdherence >= 60 ? 'text-yellow-600' :
                  'text-red-600'
                }
              />
              
              <MetricStatsCard
                title="Protein Consistency"
                value={`${analytics.proteinConsistency}%`}
                subtitle="Days meeting 80% of target"
                icon="💪"
                valueColor={
                  analytics.proteinConsistency >= 80 ? 'text-green-600' :
                  analytics.proteinConsistency >= 60 ? 'text-yellow-600' :
                  'text-red-600'
                }
              />
            </div>
          )}
          
          {/* Weight Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Weight Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <WeightChart entries={filteredEntries} />
            </CardContent>
          </Card>
          
          {/* Calorie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Calorie Intake</CardTitle>
            </CardHeader>
            <CardContent>
              <CalorieChart
                entries={filteredEntries}
                target={profile?.dailyCalorieTarget}
              />
              {profile && (
                <div className="mt-4 flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-green-500" />
                    <span>Within 10% of target</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-yellow-500" />
                    <span>10-20% variance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-red-500" />
                    <span>Over 20% variance</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Protein Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Protein Intake</CardTitle>
            </CardHeader>
            <CardContent>
              <ProteinChart
                entries={filteredEntries}
                target={profile?.dailyProteinTarget}
              />
            </CardContent>
          </Card>
          
          {/* Water & Sleep Stats */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Average Water Intake</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{analytics.avgWater}L</div>
                  <p className="text-sm text-muted-foreground">
                    {profile ? `Target: ${profile.dailyWaterTarget}L per day` : 'Daily average'}
                  </p>
                  {profile && (
                    <div className={`mt-4 text-sm font-medium ${
                      analytics.avgWater >= profile.dailyWaterTarget ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      {analytics.avgWater >= profile.dailyWaterTarget
                        ? '✓ Meeting hydration goal'
                        : '⚠ Below hydration goal'
                      }
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Average Sleep</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{analytics.avgSleep}h</div>
                  <p className="text-sm text-muted-foreground">
                    {profile ? `Target: ${profile.dailySleepTarget}h per night` : 'Daily average'}
                  </p>
                  {profile && (
                    <div className={`mt-4 text-sm font-medium ${
                      analytics.avgSleep >= profile.dailySleepTarget ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      {analytics.avgSleep >= profile.dailySleepTarget
                        ? '✓ Meeting sleep goal'
                        : '⚠ Below sleep goal'
                      }
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {!profile && (
            <Card className="border-primary">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="font-semibold mb-2">Set Your Goals for Better Insights</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure your daily targets to track adherence and consistency
                  </p>
                  <Link href="/nutrition/settings">
                    <Button>Set Goals</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
