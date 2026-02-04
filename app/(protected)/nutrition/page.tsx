"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, BarChart3, Settings, TrendingUp, TrendingDown, Camera } from "lucide-react";
import { db } from "@/lib/instant";
import { getTodayString } from "@/lib/date-utils";
import { NutritionEntryCard } from "@/components/nutrition/NutritionEntryCard";
import { calculateWeightChange, getWeightTrend, getEntryForDate } from "@/lib/nutrition";
import type { NutritionEntry, NutritionProfile } from "@/types";

export default function NutritionPage() {
  const { user } = db.useAuth();
  const today = getTodayString();
  
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
  
  const entries = (entriesData?.nutritionEntries || []) as unknown as NutritionEntry[];
  const profile = (profileData?.nutritionProfiles?.[0] || null) as NutritionProfile | null;
  
  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const [showAll, setShowAll] = useState(false);
  const displayEntries = showAll ? sortedEntries : sortedEntries.slice(0, 7);
  
  const todayEntry = getEntryForDate(entries, today);
  const hasTodayEntry = !!todayEntry;
  
  // Calculate stats
  const totalEntries = entries.length;
  const currentWeight = sortedEntries[0]?.bodyWeight || 0;
  const weightChange = calculateWeightChange(entries);
  const weightTrend = getWeightTrend(entries);
  
  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nutrition Tracker</h1>
          <p className="text-muted-foreground">Track your diet and progress</p>
        </div>
        <Link href="/nutrition/settings">
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      
      {/* Sticky CTA */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 -mx-4 px-4 md:mx-0 md:px-0">
        <Link href={hasTodayEntry ? `/nutrition/${todayEntry.id}/edit` : "/nutrition/new"}>
          <Button className="w-full" size="lg">
            <Plus className="mr-2 h-5 w-5" />
            {hasTodayEntry ? "Edit Today's Entry" : "Add Today's Entry"}
          </Button>
        </Link>
      </div>
      
      {/* Quick Stats */}
      {totalEntries > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
              <span className="text-2xl">⚖️</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentWeight} kg</div>
              {weightChange !== 0 && (
                <div className={`flex items-center gap-1 text-xs mt-1 ${
                  weightTrend === 'loss' ? 'text-green-600' : 
                  weightTrend === 'gain' ? 'text-red-600' : 
                  'text-muted-foreground'
                }`}>
                  {weightTrend === 'loss' && <TrendingDown className="h-3 w-3" />}
                  {weightTrend === 'gain' && <TrendingUp className="h-3 w-3" />}
                  <span>
                    {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg overall
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
              <span className="text-2xl">📝</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEntries}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Days tracked
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Status</CardTitle>
              <span className="text-2xl">
                {hasTodayEntry ? '✅' : '⏳'}
              </span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {hasTodayEntry ? 'Logged' : 'Pending'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {hasTodayEntry ? 'Entry completed' : 'Add your entry'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/nutrition/analytics">
          <Card className="cursor-pointer transition-colors hover:bg-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View trends and insights
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/nutrition/images">
          <Card className="cursor-pointer transition-colors hover:bg-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Camera className="h-5 w-5" />
                Progress Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Weekly photo gallery
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/nutrition/settings">
          <Card className="cursor-pointer transition-colors hover:bg-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5" />
                Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Set daily targets
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
      
      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {entriesLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading entries...
            </div>
          ) : totalEntries === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 text-6xl">🍎</div>
              <h3 className="mb-2 text-lg font-semibold">No entries yet</h3>
              <p className="mb-4 text-sm text-muted-foreground max-w-sm">
                Start tracking your nutrition journey by adding your first daily entry
              </p>
              <Link href="/nutrition/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Entry
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {displayEntries.map((entry) => (
                <NutritionEntryCard key={entry.id} entry={entry} />
              ))}
              
              {totalEntries > 7 && (
                <div className="pt-2 text-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowAll(!showAll)}
                    className="w-full"
                  >
                    {showAll ? `Show Less` : `Show All ${totalEntries} Entries`}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {!profile && totalEntries > 0 && (
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Settings className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Set Your Nutrition Goals</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Configure your daily targets to get personalized insights and track adherence
                </p>
                <Link href="/nutrition/settings">
                  <Button size="sm">
                    Set Goals
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
