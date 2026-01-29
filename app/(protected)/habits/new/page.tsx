"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/lib/instant";
import { useToast } from "@/components/ui/toast";
import { getTodayString } from "@/lib/date-utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const HABIT_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
];

const HABIT_ICONS = [
  "💪", "🏃", "📚", "✍️", "🧘", "🎨", "🎵", "💻",
  "🌱", "💧", "🥗", "🛌", "🧹", "📝", "🎯", "🔥",
  "⚡", "🌟", "🎓", "💼", "🏋️", "🚴", "🏊", "⚽",
];

const DAYS_OF_WEEK = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

export default function NewHabitPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { user } = db.useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "custom">("daily");
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [when, setWhen] = useState("");
  const [where, setWhere] = useState("");
  const [color, setColor] = useState(HABIT_COLORS[0]);
  const [icon, setIcon] = useState(HABIT_ICONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCustomDayToggle = (day: number) => {
    if (customDays.includes(day)) {
      setCustomDays(customDays.filter((d) => d !== day));
    } else {
      setCustomDays([...customDays, day].sort());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      addToast("Please enter a habit title", "error");
      return;
    }

    if (frequency === "custom" && customDays.length === 0) {
      addToast("Please select at least one day", "error");
      return;
    }

    if (!user) {
      addToast("You must be logged in to create a habit", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const habitId = crypto.randomUUID();
      const now = Date.now();

      await db.transact([
        db.tx.habits[habitId].update({
          title: title.trim(),
          description: description.trim() || undefined,
          frequency,
          customDays: frequency === "custom" ? customDays : undefined,
          startDate: getTodayString(),
          when: when.trim() || undefined,
          where: where.trim() || undefined,
          isActive: true,
          color,
          icon,
          createdAt: now,
          updatedAt: now,
        }).link({ user: user.id }),
      ]);

      addToast("Habit created successfully! 🎉", "success");
      router.push("/habits");
    } catch (error) {
      console.error("Error creating habit:", error);
      addToast("Failed to create habit. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/habits">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Habit</h1>
          <p className="text-muted-foreground">
            Build consistency by tracking your daily habits
          </p>
        </div>
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
                placeholder="e.g., Morning Exercise, Read 30 minutes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add more details about your habit..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={500}
              />
            </div>

            {/* When (Time) */}
            <div className="space-y-2">
              <Label htmlFor="when">When (Time - 24hr format) (Optional)</Label>
              <Input
                id="when"
                type="time"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                placeholder="HH:MM"
              />
              <p className="text-xs text-muted-foreground">
                Set a specific time for this habit (e.g., 07:00 for morning routine)
              </p>
            </div>

            {/* Where (Location) */}
            <div className="space-y-2">
              <Label htmlFor="where">Where (Location) (Optional)</Label>
              <Input
                id="where"
                placeholder="e.g., Gym, Home Office, Park"
                value={where}
                onChange={(e) => setWhere(e.target.value)}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                Specify where you'll perform this habit
              </p>
            </div>

            {/* Frequency */}
            <div className="space-y-3">
              <Label>
                Frequency <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={frequency === "daily" ? "default" : "outline"}
                  onClick={() => setFrequency("daily")}
                  className="flex-1"
                >
                  Daily
                </Button>
                <Button
                  type="button"
                  variant={frequency === "weekly" ? "default" : "outline"}
                  onClick={() => setFrequency("weekly")}
                  className="flex-1"
                >
                  Weekly
                </Button>
                <Button
                  type="button"
                  variant={frequency === "custom" ? "default" : "outline"}
                  onClick={() => setFrequency("custom")}
                  className="flex-1"
                >
                  Custom
                </Button>
              </div>

              {/* Custom Days Selection */}
              {frequency === "custom" && (
                <div className="space-y-2 pt-2">
                  <Label className="text-sm">Select Days</Label>
                  <div className="flex gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <Button
                        key={day.value}
                        type="button"
                        variant={customDays.includes(day.value) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleCustomDayToggle(day.value)}
                        className="flex-1"
                      >
                        {day.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Icon */}
            <div className="space-y-3">
              <Label>Icon</Label>
              <div className="grid grid-cols-8 gap-2">
                {HABIT_ICONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    className={`p-3 text-2xl rounded-lg border-2 transition-all hover:scale-110 ${
                      icon === emoji
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="space-y-3">
              <Label>Color</Label>
              <div className="grid grid-cols-8 gap-2">
                {HABIT_COLORS.map((habitColor) => (
                  <button
                    key={habitColor}
                    type="button"
                    onClick={() => setColor(habitColor)}
                    className={`h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                      color === habitColor
                        ? "border-foreground"
                        : "border-border"
                    }`}
                    style={{ backgroundColor: habitColor }}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{title || "Your Habit"}</h3>
                    {description && (
                      <p className="text-sm text-muted-foreground">{description}</p>
                    )}
                    <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                      {when && <span>⏰ {when}</span>}
                      {where && <span>📍 {where}</span>}
                    </div>
                  </div>
                  <div
                    className="w-1 h-16 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Link href="/habits" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="flex-1"
              >
                {isSubmitting ? "Creating..." : "Create Habit"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
