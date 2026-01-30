"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2 } from "lucide-react";

const STEP_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e",
  "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
  "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
];

export interface StepFormData {
  id: string;
  label: string;
  durationMs: number;
  color?: string;
  groupId?: string;
}

interface TimerStepInputProps {
  step: StepFormData;
  index: number;
  onChange: (id: string, field: keyof StepFormData, value: any) => void;
  onDelete: (id: string) => void;
  onDragStart?: (index: number) => void;
  onDragOver?: (index: number) => void;
  onDragEnd?: () => void;
}

export function TimerStepInput({
  step,
  index,
  onChange,
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
}: TimerStepInputProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // Convert ms to minutes and seconds
  const minutes = Math.floor(step.durationMs / 60000);
  const seconds = Math.floor((step.durationMs % 60000) / 1000);
  
  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinutes = Math.max(0, Math.min(1440, parseInt(e.target.value) || 0)); // Max 24 hours
    const newDurationMs = newMinutes * 60000 + seconds * 1000;
    onChange(step.id, "durationMs", newDurationMs);
  };
  
  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSeconds = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
    const newDurationMs = minutes * 60000 + newSeconds * 1000;
    onChange(step.id, "durationMs", newDurationMs);
  };
  
  return (
    <div
      className="border rounded-lg p-4 bg-card space-y-3"
      draggable
      onDragStart={() => onDragStart?.(index)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver?.(index);
      }}
      onDragEnd={onDragEnd}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="h-5 w-5" />
        </button>
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Label */}
          <div className="md:col-span-2">
            <Label htmlFor={`step-${step.id}-label`} className="text-xs">
              Step Label
            </Label>
            <Input
              id={`step-${step.id}-label`}
              value={step.label}
              onChange={(e) => onChange(step.id, "label", e.target.value)}
              placeholder="e.g., Warmup, Rest, Exercise"
              maxLength={80}
            />
          </div>
          
          {/* Duration with Mobile-Style Picker */}
          <div className="space-y-2">
            <Label className="text-xs">Duration</Label>
            <div className="flex gap-2 items-center">
              {/* Minutes */}
              <div className="flex-1 flex items-center border rounded-lg bg-background">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newMinutes = Math.max(0, minutes - 1);
                    onChange(step.id, "durationMs", newMinutes * 60000 + seconds * 1000);
                  }}
                  className="h-10 px-2"
                >
                  −
                </Button>
                <div className="flex-1 text-center">
                  <Input
                    id={`step-${step.id}-minutes`}
                    type="number"
                    min="0"
                    max="1440"
                    value={minutes}
                    onChange={handleMinutesChange}
                    className="text-center border-0 focus-visible:ring-0 text-lg font-semibold"
                  />
                  <div className="text-xs text-muted-foreground -mt-1">min</div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newMinutes = Math.min(1440, minutes + 1);
                    onChange(step.id, "durationMs", newMinutes * 60000 + seconds * 1000);
                  }}
                  className="h-10 px-2"
                >
                  +
                </Button>
              </div>
              
              {/* Seconds */}
              <div className="flex-1 flex items-center border rounded-lg bg-background">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newSeconds = Math.max(0, seconds - 1);
                    onChange(step.id, "durationMs", minutes * 60000 + newSeconds * 1000);
                  }}
                  className="h-10 px-2"
                >
                  −
                </Button>
                <div className="flex-1 text-center">
                  <Input
                    id={`step-${step.id}-seconds`}
                    type="number"
                    min="0"
                    max="59"
                    value={seconds}
                    onChange={handleSecondsChange}
                    className="text-center border-0 focus-visible:ring-0 text-lg font-semibold"
                  />
                  <div className="text-xs text-muted-foreground -mt-1">sec</div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newSeconds = Math.min(59, seconds + 1);
                    onChange(step.id, "durationMs", minutes * 60000 + newSeconds * 1000);
                  }}
                  className="h-10 px-2"
                >
                  +
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onDelete(step.id)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Color Picker */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-xs">Color (optional)</Label>
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {showColorPicker ? "Hide" : "Show"}
          </button>
        </div>
        
        {showColorPicker && (
          <div className="grid grid-cols-8 gap-2">
            {STEP_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onChange(step.id, "color", color)}
                className={`h-8 rounded border-2 transition-all hover:scale-110 ${
                  step.color === color
                    ? "border-foreground ring-2 ring-offset-2 ring-foreground"
                    : "border-border"
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
            {step.color && (
              <button
                type="button"
                onClick={() => onChange(step.id, "color", undefined)}
                className="h-8 rounded border-2 border-dashed border-muted-foreground hover:border-foreground flex items-center justify-center text-xs"
                aria-label="Clear color"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
