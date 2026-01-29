"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, CheckCircle2, Circle, Flame, Edit2, Trash2, X } from "lucide-react";
import { db } from "@/lib/instant";
import { useToast } from "@/components/ui/toast";
import { getTodayString } from "@/lib/date-utils";
import { calculateStreak, isHabitCompletedToday } from "@/lib/habits";
import type { Habit, HabitCompletion } from "@/types";

const HABIT_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e",
  "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
  "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
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

export default function HabitsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { user } = db.useAuth();
  const [selectedHabit, setSelectedHabit] = useState<(Habit & { completions: HabitCompletion[] }) | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editFrequency, setEditFrequency] = useState<"daily" | "weekly" | "custom">("daily");
  const [editCustomDays, setEditCustomDays] = useState<number[]>([]);
  const [editWhen, setEditWhen] = useState("");
  const [editWhere, setEditWhere] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Query habits and completions - filtered by current user
  const { data, isLoading } = db.useQuery({
    habits: {
      $: {
        where: {
          user: user?.id || "",
        },
      },
      completions: {},
    },
  });

  const habits = (data?.habits || []) as unknown as (Habit & {
    completions: HabitCompletion[];
  })[];

  const activeHabits = habits.filter((h) => h.isActive);
  const archivedHabits = habits.filter((h) => !h.isActive);

  const handleToggleCompletion = async (habit: Habit & { completions: HabitCompletion[] }, e: React.MouseEvent) => {
    e.stopPropagation();
    const today = getTodayString();
    const isCompleted = isHabitCompletedToday(habit.completions);

    try {
      if (isCompleted) {
        const todayCompletion = habit.completions.find((c) => c.completedDate === today);
        if (todayCompletion) {
          await db.transact([db.tx.habitCompletions[todayCompletion.id].delete()]);
          addToast("Completion removed", "info");
        }
      } else {
        await db.transact([
          db.tx.habitCompletions[crypto.randomUUID()]
            .update({
              completedDate: today,
              completedAt: Date.now(),
            })
            .link({ habit: habit.id, user: user!.id }),
        ]);
        addToast("Habit completed! 🎉", "success");
      }
    } catch (error) {
      console.error("Error toggling completion:", error);
      addToast("Failed to update habit. Please try again.", "error");
    }
  };

  const openHabitDetail = (habit: Habit & { completions: HabitCompletion[] }) => {
    setSelectedHabit(habit);
    setIsEditing(false);
    setShowDeleteConfirm(false);
    // Initialize edit form
    setEditTitle(habit.title);
    setEditDescription(habit.description || "");
    setEditFrequency(habit.frequency as "daily" | "weekly" | "custom");
    setEditCustomDays(habit.customDays || []);
    setEditWhen(habit.when || "");
    setEditWhere(habit.where || "");
    setEditColor(habit.color);
    setEditIcon(habit.icon);
  };

  const closeModal = () => {
    setSelectedHabit(null);
    setIsEditing(false);
    setShowDeleteConfirm(false);
  };

  const handleEditCustomDayToggle = (day: number) => {
    if (editCustomDays.includes(day)) {
      setEditCustomDays(editCustomDays.filter((d) => d !== day));
    } else {
      setEditCustomDays([...editCustomDays, day].sort());
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedHabit || !editTitle.trim()) {
      addToast("Please enter a habit title", "error");
      return;
    }

    if (editFrequency === "custom" && editCustomDays.length === 0) {
      addToast("Please select at least one day", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      await db.transact([
        db.tx.habits[selectedHabit.id].update({
          title: editTitle.trim(),
          description: editDescription.trim() || undefined,
          frequency: editFrequency,
          customDays: editFrequency === "custom" ? editCustomDays : undefined,
          when: editWhen.trim() || undefined,
          where: editWhere.trim() || undefined,
          color: editColor,
          icon: editIcon,
          updatedAt: Date.now(),
        }),
      ]);

      addToast("Habit updated successfully!", "success");
      setIsEditing(false);
      closeModal();
    } catch (error) {
      console.error("Error updating habit:", error);
      addToast("Failed to update habit. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedHabit) return;

    setIsSubmitting(true);

    try {
      // Delete all completions first
      const completionDeletes = selectedHabit.completions.map((c) =>
        db.tx.habitCompletions[c.id].delete()
      );

      // Then delete the habit
      await db.transact([
        ...completionDeletes,
        db.tx.habits[selectedHabit.id].delete(),
      ]);

      addToast("Habit deleted successfully", "success");
      closeModal();
    } catch (error) {
      console.error("Error deleting habit:", error);
      addToast("Failed to delete habit. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchiveToggle = async () => {
    if (!selectedHabit) return;

    try {
      await db.transact([
        db.tx.habits[selectedHabit.id].update({
          isActive: !selectedHabit.isActive,
          updatedAt: Date.now(),
        }),
      ]);

      addToast(
        selectedHabit.isActive ? "Habit archived" : "Habit restored",
        "success"
      );
      closeModal();
    } catch (error) {
      console.error("Error toggling archive:", error);
      addToast("Failed to update habit. Please try again.", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Habits</h1>
            <p className="text-muted-foreground">Loading your habits...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Habits</h1>
          <p className="text-muted-foreground">
            Manage and track your daily habits
          </p>
        </div>
        <Link href="/habits/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Habit
          </Button>
        </Link>
      </div>

      {habits.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 text-6xl">🎯</div>
            <h3 className="mb-2 text-lg font-semibold">No habits yet</h3>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Create your first habit to start building consistency and tracking your progress.
            </p>
            <Link href="/habits/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Habit
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Active Habits */}
          {activeHabits.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Active Habits ({activeHabits.length})</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {activeHabits.map((habit) => {
                  const currentStreak = calculateStreak(habit.completions);
                  const streakProgress = Math.min(Math.round((currentStreak / 66) * 100), 100);
                  const isCompleted = isHabitCompletedToday(habit.completions);
                  const totalCompletions = habit.completions.length;

                  return (
                    <Card
                      key={habit.id}
                      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => openHabitDetail(habit)}
                    >
                      <div
                        className="h-2"
                        style={{ backgroundColor: habit.color }}
                      />
                      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="text-3xl">{habit.icon}</div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{habit.title}</CardTitle>
                            {habit.description && (
                              <p className="mt-1 text-sm text-muted-foreground">
                                {habit.description}
                              </p>
                            )}
                            {(habit.when || habit.where) && (
                              <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                                {habit.when && <span>⏰ {habit.when}</span>}
                                {habit.where && <span>📍 {habit.where}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-1 ml-2">
                          <button
                            onClick={(e) => handleToggleCompletion(habit, e)}
                            className="transition-transform hover:scale-110"
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-8 w-8 text-green-500" />
                            ) : (
                              <Circle className="h-8 w-8 text-muted-foreground hover:text-primary" />
                            )}
                          </button>
                          {isCompleted && (
                            <span className="text-xs font-semibold text-green-600">
                              Completed
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Flame className="h-4 w-4 text-orange-500" />
                            <span className="font-medium">
                              {currentStreak} day{currentStreak !== 1 ? "s" : ""} streak
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{streakProgress}%</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progress to 66 days</span>
                            <span>{currentStreak}/66 days</span>
                          </div>
                          <Progress value={streakProgress} />
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {habit.frequency}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {totalCompletions} completion{totalCompletions !== 1 ? "s" : ""}
                          </Badge>
                          {currentStreak > 0 && (
                            <Badge variant="default" className="text-xs bg-orange-500">
                              🔥 {currentStreak} streak
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Archived Habits */}
          {archivedHabits.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-muted-foreground">
                Archived ({archivedHabits.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {archivedHabits.map((habit) => {
                  const totalCompletions = habit.completions.length;

                  return (
                    <Card
                      key={habit.id}
                      className="opacity-60 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => openHabitDetail(habit)}
                    >
                      <CardHeader>
                        <div className="flex items-start gap-3">
                          <div className="text-3xl">{habit.icon}</div>
                          <div>
                            <CardTitle className="text-lg">{habit.title}</CardTitle>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {totalCompletions} total completions
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Habit Detail Modal */}
      <Dialog open={!!selectedHabit && !showDeleteConfirm} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedHabit && (
            <>
              {!isEditing ? (
                // View Mode
                <>
                  <DialogHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{selectedHabit.icon}</span>
                        <div>
                          <DialogTitle className="text-2xl">{selectedHabit.title}</DialogTitle>
                          {selectedHabit.description && (
                            <DialogDescription className="mt-2">
                              {selectedHabit.description}
                            </DialogDescription>
                          )}
                        </div>
                      </div>
                      <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg border p-4">
                        <div className="text-sm text-muted-foreground">Current Streak</div>
                        <div className="text-2xl font-bold flex items-center gap-2">
                          <Flame className="h-6 w-6 text-orange-500" />
                          {calculateStreak(selectedHabit.completions)} days
                        </div>
                      </div>
                      <div className="rounded-lg border p-4">
                        <div className="text-sm text-muted-foreground">Total Completions</div>
                        <div className="text-2xl font-bold">{selectedHabit.completions.length}</div>
                      </div>
                    </div>

                    {/* Progress to 66 days */}
                    <div className="rounded-lg border p-4">
                      <div className="text-sm font-medium mb-2">Progress to Habit Formation (66 days)</div>
                      <div className="space-y-2">
                        <Progress value={Math.min((calculateStreak(selectedHabit.completions) / 66) * 100, 100)} />
                        <div className="text-xs text-muted-foreground text-right">
                          {calculateStreak(selectedHabit.completions)}/66 days
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Frequency:</span>
                        <Badge variant="secondary">{selectedHabit.frequency}</Badge>
                      </div>
                      {selectedHabit.when && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">When:</span>
                          <span>⏰ {selectedHabit.when}</span>
                        </div>
                      )}
                      {selectedHabit.where && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Where:</span>
                          <span>📍 {selectedHabit.where}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Status:</span>
                        <Badge variant={selectedHabit.isActive ? "default" : "secondary"}>
                          {selectedHabit.isActive ? "Active" : "Archived"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={handleArchiveToggle}
                      className="w-full sm:w-auto"
                    >
                      {selectedHabit.isActive ? "Archive" : "Restore"}
                    </Button>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                        className="flex-1 sm:flex-none"
                      >
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex-1 sm:flex-none"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </DialogFooter>
                </>
              ) : (
                // Edit Mode
                <>
                  <DialogHeader>
                    <DialogTitle>Edit Habit</DialogTitle>
                    <DialogDescription>
                      Make changes to your habit details
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-title">Title *</Label>
                      <Input
                        id="edit-title"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        maxLength={100}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea
                        id="edit-description"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={3}
                        maxLength={500}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-when">When (Time)</Label>
                      <Input
                        id="edit-when"
                        type="time"
                        value={editWhen}
                        onChange={(e) => setEditWhen(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-where">Where (Location)</Label>
                      <Input
                        id="edit-where"
                        value={editWhere}
                        onChange={(e) => setEditWhere(e.target.value)}
                        maxLength={100}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Frequency *</Label>
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant={editFrequency === "daily" ? "default" : "outline"}
                          onClick={() => setEditFrequency("daily")}
                          className="flex-1"
                        >
                          Daily
                        </Button>
                        <Button
                          type="button"
                          variant={editFrequency === "weekly" ? "default" : "outline"}
                          onClick={() => setEditFrequency("weekly")}
                          className="flex-1"
                        >
                          Weekly
                        </Button>
                        <Button
                          type="button"
                          variant={editFrequency === "custom" ? "default" : "outline"}
                          onClick={() => setEditFrequency("custom")}
                          className="flex-1"
                        >
                          Custom
                        </Button>
                      </div>

                      {editFrequency === "custom" && (
                        <div className="flex gap-2 pt-2">
                          {DAYS_OF_WEEK.map((day) => (
                            <Button
                              key={day.value}
                              type="button"
                              variant={editCustomDays.includes(day.value) ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleEditCustomDayToggle(day.value)}
                              className="flex-1"
                            >
                              {day.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Icon</Label>
                      <div className="grid grid-cols-8 gap-2">
                        {HABIT_ICONS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setEditIcon(emoji)}
                            className={`p-2 text-2xl rounded-lg border-2 transition-all hover:scale-110 ${
                              editIcon === emoji
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Color</Label>
                      <div className="grid grid-cols-8 gap-2">
                        {HABIT_COLORS.map((habitColor) => (
                          <button
                            key={habitColor}
                            type="button"
                            onClick={() => setEditColor(habitColor)}
                            className={`h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                              editColor === habitColor
                                ? "border-foreground"
                                : "border-border"
                            }`}
                            style={{ backgroundColor: habitColor }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveEdit}
                      disabled={isSubmitting || !editTitle.trim()}
                    >
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </DialogFooter>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Habit?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedHabit?.title}"? This action cannot be undone.
              All completion history will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete Habit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
