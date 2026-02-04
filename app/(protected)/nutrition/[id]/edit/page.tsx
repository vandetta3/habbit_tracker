"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2 } from "lucide-react";
import { db } from "@/lib/instant";
import { useToast } from "@/components/ui/toast";
import { NutritionEntryForm } from "@/components/nutrition/NutritionEntryForm";
import type { NutritionEntry } from "@/types";

export default function EditNutritionEntryPage() {
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const { user } = db.useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const entryId = params.id as string;
  
  // Query the specific entry
  const { data, isLoading } = db.useQuery({
    nutritionEntries: {
      $: {
        where: {
          id: entryId,
          user: user?.id || "",
        },
      },
    },
  });
  
  const entry = (data?.nutritionEntries?.[0] || null) as NutritionEntry | null;
  
  const handleSubmit = async (formData: {
    caloriesIntake: number;
    proteinIntake: number;
    bodyWeight: number;
    sleepHours: number;
    waterIntake: number;
    date: string;
    notes?: string;
  }) => {
    if (!entry) return;
    
    setIsSubmitting(true);
    
    try {
      await db.transact([
        db.tx.nutritionEntries[entry.id].update({
          caloriesIntake: formData.caloriesIntake,
          proteinIntake: formData.proteinIntake,
          bodyWeight: formData.bodyWeight,
          sleepHours: formData.sleepHours,
          waterIntake: formData.waterIntake,
          date: formData.date,
          notes: formData.notes || "",
          updatedAt: Date.now(),
        }),
      ]);
      
      addToast("Entry updated successfully!", "success");
      router.push("/nutrition");
    } catch (error) {
      console.error("Error updating entry:", error);
      addToast("Failed to update entry. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!entry) return;
    
    const confirmed = window.confirm(
      "Are you sure you want to delete this entry? This action cannot be undone."
    );
    
    if (!confirmed) return;
    
    setIsDeleting(true);
    
    try {
      await db.transact([db.tx.nutritionEntries[entry.id].delete()]);
      
      addToast("Entry deleted successfully", "info");
      router.push("/nutrition");
    } catch (error) {
      console.error("Error deleting entry:", error);
      addToast("Failed to delete entry. Please try again.", "error");
      setIsDeleting(false);
    }
  };
  
  if (isLoading) {
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
            <h1 className="text-3xl font-bold tracking-tight">Edit Entry</h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!entry) {
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
            <h1 className="text-3xl font-bold tracking-tight">Entry Not Found</h1>
            <p className="text-muted-foreground">This entry does not exist</p>
          </div>
        </div>
      </div>
    );
  }
  
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
            <h1 className="text-3xl font-bold tracking-tight">Edit Entry</h1>
            <p className="text-muted-foreground">Update your nutrition data</p>
          </div>
        </div>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Edit Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <NutritionEntryForm
            entry={entry}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
