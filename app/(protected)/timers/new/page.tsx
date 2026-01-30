"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Save } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/instant";
import { useToast } from "@/components/ui/toast";
import { TimerStepInput, type StepFormData } from "@/components/timers/TimerStepInput";
import { RepeatGroupManager, type GroupFormData } from "@/components/timers/RepeatGroupManager";
import { SoundSettingsPanel } from "@/components/timers/SoundSettingsPanel";
import { DEFAULT_SOUND_PREFERENCES, getMergedSoundSettings } from "@/lib/sound-manager";
import type { MergedSoundSettings } from "@/types";
import { AudioEngine } from "@/lib/audio-engine";

export default function NewTimerPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { user } = db.useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioEngine] = useState(() => new AudioEngine());

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [repeatEntireRoutine, setRepeatEntireRoutine] = useState(1);
  const [steps, setSteps] = useState<StepFormData[]>([
    {
      id: crypto.randomUUID(),
      label: "",
      durationMs: 60000, // 1 minute default
      color: undefined,
    },
  ]);
  const [groups, setGroups] = useState<GroupFormData[]>([]);
  const [soundSettings, setSoundSettings] = useState<MergedSoundSettings>({
    ...DEFAULT_SOUND_PREFERENCES,
  });
  const [useCustomSoundSettings, setUseCustomSoundSettings] = useState(false);

  // Drag and drop state
  const [draggedStepIndex, setDraggedStepIndex] = useState<number | null>(null);

  const handleStepChange = (id: string, field: keyof StepFormData, value: any) => {
    setSteps(steps.map(step => 
      step.id === id ? { ...step, [field]: value } : step
    ));
  };

  const handleAddStep = () => {
    setSteps([
      ...steps,
      {
        id: crypto.randomUUID(),
        label: "",
        durationMs: 60000,
        color: undefined,
      },
    ]);
  };

  const handleDeleteStep = (id: string) => {
    if (steps.length === 1) {
      addToast("Timer must have at least one step", "error");
      return;
    }
    setSteps(steps.filter(step => step.id !== id));
    // Remove step from any groups
    setGroups(groups.map(group => ({
      ...group,
      stepIds: group.stepIds.filter(sid => sid !== id),
    })).filter(group => group.stepIds.length >= 2)); // Remove groups with less than 2 steps
  };

  const handleDragStart = (index: number) => {
    setDraggedStepIndex(index);
  };

  const handleDragOver = (index: number) => {
    if (draggedStepIndex === null || draggedStepIndex === index) return;
    
    const newSteps = [...steps];
    const draggedStep = newSteps[draggedStepIndex];
    newSteps.splice(draggedStepIndex, 1);
    newSteps.splice(index, 0, draggedStep);
    
    setSteps(newSteps);
    setDraggedStepIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedStepIndex(null);
  };

  const handleGroupCreate = (stepIds: string[], repeatCount: number, name?: string) => {
    const newGroup: GroupFormData = {
      id: crypto.randomUUID(),
      name,
      repeatCount,
      stepIds,
    };
    setGroups([...groups, newGroup]);
    
    // Update steps with groupId
    setSteps(steps.map(step => 
      stepIds.includes(step.id) ? { ...step, groupId: newGroup.id } : step
    ));
  };

  const handleGroupUpdate = (groupId: string, field: keyof GroupFormData, value: any) => {
    setGroups(groups.map(group => 
      group.id === groupId ? { ...group, [field]: value } : group
    ));
  };

  const handleGroupDelete = (groupId: string) => {
    setGroups(groups.filter(g => g.id !== groupId));
    // Remove groupId from steps
    setSteps(steps.map(step => 
      step.groupId === groupId ? { ...step, groupId: undefined } : step
    ));
  };

  const handleSoundSettingChange = (field: keyof MergedSoundSettings, value: any) => {
    setSoundSettings({ ...soundSettings, [field]: value });
    setUseCustomSoundSettings(true);
  };

  const handleTestSound = () => {
    if (!audioEngine.isReady()) {
      audioEngine.initialize();
    }
    audioEngine.setVolume(soundSettings.volume);
    audioEngine.beep(800, 150);
  };

  const validateForm = () => {
    if (!name.trim()) {
      addToast("Please enter a timer name", "error");
      return false;
    }
    if (name.trim().length < 2 || name.trim().length > 80) {
      addToast("Timer name must be between 2 and 80 characters", "error");
      return false;
    }
    if (steps.length === 0) {
      addToast("Timer must have at least one step", "error");
      return false;
    }
    for (const step of steps) {
      if (!step.label.trim()) {
        addToast("All steps must have a label", "error");
        return false;
      }
      if (step.durationMs < 1000) {
        addToast("Step duration must be at least 1 second", "error");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const now = Date.now();
      const timerId = crypto.randomUUID();
      const parsedTags = tags.trim() ? tags.split(",").map(t => t.trim()).filter(Boolean) : undefined;
      
      // Create timer
      const timerTx = db.tx.timers[timerId]
        .update({
          name: name.trim(),
          description: description.trim() || undefined,
          tags: parsedTags,
          repeatEntireRoutine,
          createdAt: now,
          updatedAt: now,
        })
        .link({ user: user!.id });
      
      // Create steps
      const stepTxs = steps.map((step, index) => {
        const stepId = step.id;
        return db.tx.timerSteps[stepId]
          .update({
            label: step.label.trim(),
            durationMs: step.durationMs,
            orderIndex: index,
            type: "countdown",
            color: step.color,
            groupId: step.groupId,
            createdAt: now,
          })
          .link({ timer: timerId });
      });
      
      // Create groups
      const groupTxs = groups.map((group, index) => {
        return db.tx.timerGroups[group.id]
          .update({
            name: group.name,
            repeatCount: group.repeatCount,
            orderIndex: index,
            createdAt: now,
          })
          .link({ timer: timerId });
      });
      
      // Create sound settings if custom
      const soundTxs = useCustomSoundSettings ? [
        db.tx.timerSoundSettings[crypto.randomUUID()]
          .update({
            soundProfile: soundSettings.soundProfile,
            warningCountdown: soundSettings.warningCountdown,
            startSound: soundSettings.startSound,
            endSound: soundSettings.endSound,
            stepChangeSound: soundSettings.stepChangeSound,
            volume: soundSettings.volume,
            createdAt: now,
            updatedAt: now,
          })
          .link({ timer: timerId })
      ] : [];
      
      // Execute all transactions
      await db.transact([timerTx, ...stepTxs, ...groupTxs, ...soundTxs]);
      
      addToast("Timer created successfully!", "success");
      router.push("/timers");
    } catch (error) {
      console.error("Error creating timer:", error);
      addToast("Failed to create timer", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/timers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Timer</h1>
          <p className="text-muted-foreground">
            Build a custom interval timer routine
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Timer Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., HIIT Workout, Tabata Timer"
                maxLength={80}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your timer routine..."
                rows={3}
                maxLength={500}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (optional, comma-separated)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., workout, training, cardio"
              />
            </div>
          </CardContent>
        </Card>

        {/* Steps Editor */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Timer Steps</CardTitle>
              <Button type="button" onClick={handleAddStep} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Step
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {steps.map((step, index) => (
              <TimerStepInput
                key={step.id}
                step={step}
                index={index}
                onChange={handleStepChange}
                onDelete={handleDeleteStep}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              />
            ))}
          </CardContent>
        </Card>

        {/* Repeat Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Repeat Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Repeat Groups */}
            {steps.length >= 2 && (
              <RepeatGroupManager
                steps={steps}
                groups={groups}
                onGroupCreate={handleGroupCreate}
                onGroupUpdate={handleGroupUpdate}
                onGroupDelete={handleGroupDelete}
              />
            )}

            {/* Repeat Entire Routine */}
            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="repeat-routine">Repeat Entire Routine</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="repeat-routine"
                  type="number"
                  min="1"
                  max="99"
                  value={repeatEntireRoutine}
                  onChange={(e) => setRepeatEntireRoutine(parseInt(e.target.value) || 1)}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">times</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sound Settings */}
        <SoundSettingsPanel
          settings={soundSettings}
          isCustom={useCustomSoundSettings}
          onChange={handleSoundSettingChange}
          onTest={handleTestSound}
        />

        {/* Submit */}
        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Creating..." : "Create Timer"}
          </Button>
          <Link href="/timers">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
