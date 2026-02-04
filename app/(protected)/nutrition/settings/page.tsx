"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import { db } from "@/lib/instant";
import { useToast } from "@/components/ui/toast";
import type { NutritionProfile } from "@/types";

export default function NutritionSettingsPage() {
  const { addToast } = useToast();
  const { user } = db.useAuth();
  
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState<string>("2000");
  const [dailyProteinTarget, setDailyProteinTarget] = useState<string>("120");
  const [dailyWaterTarget, setDailyWaterTarget] = useState<string>("2.5");
  const [dailySleepTarget, setDailySleepTarget] = useState<string>("8");
  const [isSaving, setIsSaving] = useState(false);
  
  // Query existing profile
  const { data, isLoading } = db.useQuery({
    nutritionProfiles: {
      $: {
        where: {
          user: user?.id || "",
        },
      },
    },
  });
  
  const profile = (data?.nutritionProfiles?.[0] || null) as NutritionProfile | null;
  
  // Load existing profile data
  useEffect(() => {
    if (profile) {
      setDailyCalorieTarget(profile.dailyCalorieTarget.toString());
      setDailyProteinTarget(profile.dailyProteinTarget.toString());
      setDailyWaterTarget(profile.dailyWaterTarget.toString());
      setDailySleepTarget(profile.dailySleepTarget.toString());
    }
  }, [profile]);
  
  const handleSave = async () => {
    const calorieTarget = parseFloat(dailyCalorieTarget);
    const proteinTarget = parseFloat(dailyProteinTarget);
    const waterTarget = parseFloat(dailyWaterTarget);
    const sleepTarget = parseFloat(dailySleepTarget);
    
    // Validation
    if (isNaN(calorieTarget) || calorieTarget < 500 || calorieTarget > 10000) {
      addToast("Please enter a valid calorie target (500-10000 kcal)", "error");
      return;
    }
    
    if (isNaN(proteinTarget) || proteinTarget < 10 || proteinTarget > 500) {
      addToast("Please enter a valid protein target (10-500g)", "error");
      return;
    }
    
    if (isNaN(waterTarget) || waterTarget < 0.5 || waterTarget > 10) {
      addToast("Please enter a valid water target (0.5-10 liters)", "error");
      return;
    }
    
    if (isNaN(sleepTarget) || sleepTarget < 4 || sleepTarget > 12) {
      addToast("Please enter a valid sleep target (4-12 hours)", "error");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const now = Date.now();
      
      if (profile) {
        // Update existing profile
        await db.transact([
          db.tx.nutritionProfiles[profile.id].update({
            dailyCalorieTarget: calorieTarget,
            dailyProteinTarget: proteinTarget,
            dailyWaterTarget: waterTarget,
            dailySleepTarget: sleepTarget,
            updatedAt: now,
          }),
        ]);
      } else {
        // Create new profile
        await db.transact([
          db.tx.nutritionProfiles[crypto.randomUUID()]
            .update({
              dailyCalorieTarget: calorieTarget,
              dailyProteinTarget: proteinTarget,
              dailyWaterTarget: waterTarget,
              dailySleepTarget: sleepTarget,
              createdAt: now,
              updatedAt: now,
            })
            .link({ user: user!.id }),
        ]);
      }
      
      addToast("Nutrition goals saved successfully!", "success");
    } catch (error) {
      console.error("Error saving profile:", error);
      addToast("Failed to save nutrition goals. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex items-center gap-4">
        <Link href="/nutrition">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nutrition Goals</h1>
          <p className="text-muted-foreground">Set your daily nutrition targets</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Daily Targets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading profile...
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="calorie-target">Daily Calorie Target (kcal)</Label>
                <Input
                  id="calorie-target"
                  type="number"
                  min="500"
                  max="10000"
                  step="50"
                  value={dailyCalorieTarget}
                  onChange={(e) => setDailyCalorieTarget(e.target.value)}
                  placeholder="2000"
                />
                <p className="text-xs text-muted-foreground">
                  Your daily calorie intake goal
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="protein-target">Daily Protein Target (grams)</Label>
                <Input
                  id="protein-target"
                  type="number"
                  min="10"
                  max="500"
                  step="5"
                  value={dailyProteinTarget}
                  onChange={(e) => setDailyProteinTarget(e.target.value)}
                  placeholder="120"
                />
                <p className="text-xs text-muted-foreground">
                  Your daily protein intake goal
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="water-target">Daily Water Target (liters)</Label>
                <Input
                  id="water-target"
                  type="number"
                  min="0.5"
                  max="10"
                  step="0.1"
                  value={dailyWaterTarget}
                  onChange={(e) => setDailyWaterTarget(e.target.value)}
                  placeholder="2.5"
                />
                <p className="text-xs text-muted-foreground">
                  Your daily water intake goal
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sleep-target">Daily Sleep Target (hours)</Label>
                <Input
                  id="sleep-target"
                  type="number"
                  min="4"
                  max="12"
                  step="0.5"
                  value={dailySleepTarget}
                  onChange={(e) => setDailySleepTarget(e.target.value)}
                  placeholder="8"
                />
                <p className="text-xs text-muted-foreground">
                  Your daily sleep goal
                </p>
              </div>
              
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Save Goals"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
