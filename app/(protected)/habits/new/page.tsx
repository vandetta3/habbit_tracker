"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/instant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { HABIT_COLORS, DAYS_OF_WEEK } from "@/lib/constants";
import { getTodayString } from "@/lib/date-utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { HabitFrequency } from "@/types";

export default function NewHabitPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { user } = db.useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    frequency: "daily" as HabitFrequency,
    customDays: [] as number[],
    color: HABIT_COLORS[0].value,
    icon: "🎯",
    startDate: getTodayString(),
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      addToast("Please enter a habit title", "error");
      return;
    }

    if (formData.title.length < 3) {
      addToast("Habit title must be at least 3 characters", "error");
      return;
    }

    if (formData.frequency === "custom" && formData.customDays.length === 0) {
      addToast("Please select at least one day for custom frequency", "error");
      return;
    }

    setLoading(true);
    try {
      const habitData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        frequency: formData.frequency,
        customDays: formData.frequency === "custom" ? formData.customDays : undefined,
        startDate: formData.startDate,
        isActive: true,
        color: formData.color,
        icon: formData.icon,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await db.transact([
        db.tx.habits[crypto.randomUUID()].update(habitData).link({ user: user!.id }),
      ]);

      addToast("Habit created successfully!", "success");
      router.push("/habits");
    } catch (error) {
      console.error("Error creating habit:", error);
      addToast("Failed to create habit. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleCustomDay = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      customDays: prev.customDays.includes(day)
        ? prev.customDays.filter((d) => d !== day)
        : [...prev.customDays, day].sort(),
    }));
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link
          href="/habits"
          className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Habits
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Create New Habit</h1>
        <p className="text-muted-foreground">
          Set up a new habit to track and build consistency
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Habit Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g., Morning Exercise, Read for 30 minutes"
                maxLength={50}
                required
              />
              <p className="text-xs text-muted-foreground">
                {formData.title.length}/50 characters
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Add details about your habit..."
                maxLength={200}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/200 characters
              </p>
            </div>

            {/* Icon */}
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex gap-2">
                {["🎯", "💪", "📚", "🏃", "🧘", "💧", "🍎", "✍️", "🎨", "🎵"].map(
                  (emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, icon: emoji }))
                      }
                      className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 text-2xl transition-colors ${
                        formData.icon === emoji
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {emoji}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {HABIT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, color: color.value }))
                    }
                    className={`h-10 w-10 rounded-full border-4 transition-transform ${
                      formData.color === color.value
                        ? "scale-110 border-foreground"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Frequency */}
            <div className="space-y-2">
              <Label>Frequency</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["daily", "weekly", "custom"] as const).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, frequency: freq }))
                    }
                    className={`rounded-lg border-2 px-4 py-2 text-sm font-medium capitalize transition-colors ${
                      formData.frequency === freq
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Days */}
            {formData.frequency === "custom" && (
              <div className="space-y-2">
                <Label>Select Days</Label>
                <div className="flex gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleCustomDay(day.value)}
                      className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 text-sm font-medium transition-colors ${
                        formData.customDays.includes(day.value)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, startDate: e.target.value }))
                }
                required
              />
            </div>

            {/* Submit */}
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Creating..." : "Create Habit"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
