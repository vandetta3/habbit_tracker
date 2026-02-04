"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/instant";
import { useToast } from "@/components/ui/toast";
import { NutritionEntryForm } from "@/components/nutrition/NutritionEntryForm";
import { getTodayString } from "@/lib/date-utils";
import type { NutritionEntry } from "@/types";

export default function NewNutritionEntryPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { user } = db.useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Query existing entries to check for duplicates
  const { data } = db.useQuery({
    nutritionEntries: {
      $: {
        where: {
          user: user?.id || "",
        },
      },
    },
  });
  
  const entries = (data?.nutritionEntries || []) as unknown as NutritionEntry[];
  
  const handleSubmit = async (formData: {
    caloriesIntake: number;
    proteinIntake: number;
    bodyWeight: number;
    sleepHours: number;
    waterIntake: number;
    date: string;
    notes?: string;
  }) => {
    // Check if entry already exists for this date
    const existingEntry = entries.find(e => e.date === formData.date);
    
    if (existingEntry) {
      addToast(
        `Entry already exists for ${formData.date}. Please edit the existing entry instead.`,
        "error"
      );
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const now = Date.now();
      
      await db.transact([
        db.tx.nutritionEntries[crypto.randomUUID()]
          .update({
            caloriesIntake: formData.caloriesIntake,
            proteinIntake: formData.proteinIntake,
            bodyWeight: formData.bodyWeight,
            sleepHours: formData.sleepHours,
            waterIntake: formData.waterIntake,
            date: formData.date,
            notes: formData.notes || "",
            createdAt: now,
            updatedAt: now,
          })
          .link({ user: user!.id }),
      ]);
      
      addToast("Entry saved successfully!", "success");
      router.push("/nutrition");
    } catch (error) {
      console.error("Error saving entry:", error);
      addToast("Failed to save entry. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
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
          <h1 className="text-3xl font-bold tracking-tight">Add Nutrition Entry</h1>
          <p className="text-muted-foreground">Log your daily nutrition data</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Daily Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <NutritionEntryForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
}
