"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Play, Edit2, Copy, Trash2, Search, Clock } from "lucide-react";
import { db } from "@/lib/instant";
import { useToast } from "@/components/ui/toast";
import { formatTime, calculateTotalDuration } from "@/lib/timer-engine";
import type { Timer, TimerStep } from "@/types";

export default function TimersPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { user } = db.useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTimer, setSelectedTimer] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Query timers with steps
  const { data, isLoading } = db.useQuery({
    timers: {
      $: {
        where: {
          user: user?.id || "",
        },
      },
      steps: {},
      groups: {},
    },
  });

  const timers = (data?.timers || []) as unknown as (Timer & {
    steps: TimerStep[];
  })[];

  // Filter timers by search query
  const filteredTimers = timers.filter((timer) => {
    const query = searchQuery.toLowerCase();
    const matchesName = timer.name.toLowerCase().includes(query);
    const matchesDescription = timer.description?.toLowerCase().includes(query);
    const matchesTags = timer.tags?.some((tag) => tag.toLowerCase().includes(query));
    return matchesName || matchesDescription || matchesTags;
  });

  const handleRun = (timerId: string) => {
    router.push(`/run/${timerId}`);
  };

  const handleEdit = (timerId: string) => {
    router.push(`/timers/${timerId}/edit`);
  };

  const handleDuplicate = async (timer: Timer & { steps: TimerStep[] }) => {
    try {
      const newTimerId = crypto.randomUUID();
      const now = Date.now();

      // Create duplicate timer
      const timerTx = db.tx.timers[newTimerId]
        .update({
          name: `${timer.name} (Copy)`,
          description: timer.description,
          tags: timer.tags,
          repeatEntireRoutine: timer.repeatEntireRoutine,
          createdAt: now,
          updatedAt: now,
        })
        .link({ user: user!.id });

      // Duplicate steps
      const stepTxs = timer.steps.map((step) => {
        const newStepId = crypto.randomUUID();
        return db.tx.timerSteps[newStepId]
          .update({
            label: step.label,
            durationMs: step.durationMs,
            orderIndex: step.orderIndex,
            type: step.type,
            color: step.color,
            createdAt: now,
          })
          .link({ timer: newTimerId });
      });

      await db.transact([timerTx, ...stepTxs]);

      addToast("Timer duplicated successfully!", "success");
      router.push(`/timers/${newTimerId}/edit`);
    } catch (error) {
      console.error("Error duplicating timer:", error);
      addToast("Failed to duplicate timer", "error");
    }
  };

  const handleDeleteConfirm = (timerId: string) => {
    setSelectedTimer(timerId);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!selectedTimer) return;

    setIsDeleting(true);
    try {
      const timer = timers.find((t) => t.id === selectedTimer);
      if (!timer) return;

      // Delete all related steps
      const stepDeletes = timer.steps.map((step) => 
        db.tx.timerSteps[step.id].delete()
      );

      // Delete the timer
      await db.transact([
        ...stepDeletes,
        db.tx.timers[selectedTimer].delete(),
      ]);

      addToast("Timer deleted successfully", "success");
      setShowDeleteConfirm(false);
      setSelectedTimer(null);
    } catch (error) {
      console.error("Error deleting timer:", error);
      addToast("Failed to delete timer", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Timers</h1>
            <p className="text-muted-foreground">Loading your timers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timers</h1>
          <p className="text-muted-foreground">
            Create and manage interval timer routines
          </p>
        </div>
        <Link href="/timers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Timer
          </Button>
        </Link>
      </div>

      {/* Search */}
      {timers.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Timers Grid */}
      {filteredTimers.length === 0 && timers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 text-6xl">⏱️</div>
            <h3 className="mb-2 text-lg font-semibold">No timers yet</h3>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Create your first interval timer to start training with custom routines
            </p>
            <Link href="/timers/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Timer
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : filteredTimers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 text-6xl">🔍</div>
            <h3 className="mb-2 text-lg font-semibold">No timers found</h3>
            <p className="text-center text-sm text-muted-foreground">
              Try adjusting your search query
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTimers.map((timer) => {
            const totalDuration = timer.steps.reduce(
              (sum, step) => sum + step.durationMs,
              0
            );
            const totalWithRepeats = totalDuration * timer.repeatEntireRoutine;
            const stepCount = timer.steps.length;

            return (
              <Card key={timer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{timer.name}</CardTitle>
                      {timer.description && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {timer.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {timer.tags && timer.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {timer.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{formatTime(totalWithRepeats)}</span>
                    </div>
                    <div className="text-muted-foreground">
                      {stepCount} step{stepCount !== 1 ? "s" : ""}
                    </div>
                    {timer.repeatEntireRoutine > 1 && (
                      <Badge variant="outline" className="text-xs">
                        {timer.repeatEntireRoutine}x
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleRun(timer.id)}
                      className="w-full"
                      size="sm"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Run
                    </Button>
                    <Button
                      onClick={() => handleEdit(timer.id)}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleDuplicate(timer)}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </Button>
                    <Button
                      onClick={() => handleDeleteConfirm(timer.id)}
                      variant="outline"
                      className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      size="sm"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Timer?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this timer? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Timer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
