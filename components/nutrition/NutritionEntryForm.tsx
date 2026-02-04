"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import type { NutritionEntry } from "@/types";

interface NutritionEntryFormProps {
  entry?: NutritionEntry;
  onSubmit: (data: {
    caloriesIntake: number;
    proteinIntake: number;
    bodyWeight: number;
    sleepHours: number;
    waterIntake: number;
    date: string;
    notes?: string;
  }) => Promise<void>;
  isSubmitting?: boolean;
}

export function NutritionEntryForm({ entry, onSubmit, isSubmitting }: NutritionEntryFormProps) {
  const [date, setDate] = useState(entry?.date || new Date().toISOString().split('T')[0]);
  const [caloriesIntake, setCaloriesIntake] = useState(entry?.caloriesIntake.toString() || "");
  const [proteinIntake, setProteinIntake] = useState(entry?.proteinIntake.toString() || "");
  const [bodyWeight, setBodyWeight] = useState(entry?.bodyWeight.toString() || "");
  const [sleepHours, setSleepHours] = useState(entry?.sleepHours.toString() || "");
  const [waterIntake, setWaterIntake] = useState(entry?.waterIntake.toString() || "");
  const [notes, setNotes] = useState(entry?.notes || "");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const calories = parseFloat(caloriesIntake);
    const protein = parseFloat(proteinIntake);
    const weight = parseFloat(bodyWeight);
    const sleep = parseFloat(sleepHours);
    const water = parseFloat(waterIntake);
    
    // Basic validation
    if (isNaN(calories) || calories < 0 || calories > 10000) {
      alert("Please enter valid calories (0-10000 kcal)");
      return;
    }
    
    if (isNaN(protein) || protein < 0 || protein > 500) {
      alert("Please enter valid protein (0-500g)");
      return;
    }
    
    if (isNaN(weight) || weight < 20 || weight > 300) {
      alert("Please enter valid body weight (20-300 kg)");
      return;
    }
    
    if (isNaN(sleep) || sleep < 0 || sleep > 24) {
      alert("Please enter valid sleep hours (0-24 hours)");
      return;
    }
    
    if (isNaN(water) || water < 0 || water > 15) {
      alert("Please enter valid water intake (0-15 liters)");
      return;
    }
    
    await onSubmit({
      caloriesIntake: calories,
      proteinIntake: protein,
      bodyWeight: parseFloat(weight.toFixed(1)),
      sleepHours: parseFloat(sleep.toFixed(1)),
      waterIntake: parseFloat(water.toFixed(1)),
      date,
      notes: notes.trim() || undefined,
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          max={new Date().toISOString().split('T')[0]}
        />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="calories">
            Calories Intake <span className="text-muted-foreground text-xs">(kcal)</span>
          </Label>
          <Input
            id="calories"
            type="number"
            min="0"
            max="10000"
            step="10"
            value={caloriesIntake}
            onChange={(e) => setCaloriesIntake(e.target.value)}
            placeholder="2000"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="protein">
            Protein Intake <span className="text-muted-foreground text-xs">(grams)</span>
          </Label>
          <Input
            id="protein"
            type="number"
            min="0"
            max="500"
            step="5"
            value={proteinIntake}
            onChange={(e) => setProteinIntake(e.target.value)}
            placeholder="120"
            required
          />
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="weight">
            Body Weight <span className="text-muted-foreground text-xs">(kg)</span>
          </Label>
          <Input
            id="weight"
            type="number"
            min="20"
            max="300"
            step="0.1"
            value={bodyWeight}
            onChange={(e) => setBodyWeight(e.target.value)}
            placeholder="70.5"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="sleep">
            Sleep Hours <span className="text-muted-foreground text-xs">(hours)</span>
          </Label>
          <Input
            id="sleep"
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={sleepHours}
            onChange={(e) => setSleepHours(e.target.value)}
            placeholder="8"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="water">
          Water Intake <span className="text-muted-foreground text-xs">(liters)</span>
        </Label>
        <Input
          id="water"
          type="number"
          min="0"
          max="15"
          step="0.1"
          value={waterIntake}
          onChange={(e) => setWaterIntake(e.target.value)}
          placeholder="2.5"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How are you feeling? Any observations..."
          rows={3}
        />
      </div>
      
      <Button type="submit" disabled={isSubmitting} className="w-full">
        <Save className="mr-2 h-4 w-4" />
        {isSubmitting ? "Saving..." : entry ? "Update Entry" : "Save Entry"}
      </Button>
    </form>
  );
}
