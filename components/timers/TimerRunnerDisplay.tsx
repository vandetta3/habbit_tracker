"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Square,
  Plus,
} from "lucide-react";
import { formatTime } from "@/lib/timer-engine";
import type { PlayableStep, TimerRunState } from "@/types";

interface TimerRunnerDisplayProps {
  state: TimerRunState;
  currentStep: PlayableStep | null;
  nextStep: PlayableStep | null;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  onPrevious: () => void;
  onAddTenSeconds: () => void;
  onRestartStep: () => void;
  onStop: () => void;
  isCompleted: boolean;
  onRunAgain?: () => void;
}

export function TimerRunnerDisplay({
  state,
  currentStep,
  nextStep,
  onStart,
  onPause,
  onResume,
  onSkip,
  onPrevious,
  onAddTenSeconds,
  onRestartStep,
  onStop,
  isCompleted,
  onRunAgain,
}: TimerRunnerDisplayProps) {
  const stepProgress = currentStep
    ? ((currentStep.durationMs - state.remainingMs) / currentStep.durationMs) * 100
    : 0;
  
  const routineProgress = state.totalSteps > 0
    ? ((state.currentStepIndex + 1) / state.totalSteps) * 100
    : 0;
  
  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="text-8xl">🎉</div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Timer Complete!</h2>
          <p className="text-muted-foreground">Great job finishing your routine</p>
        </div>
        <div className="flex gap-3">
          {onRunAgain && (
            <Button onClick={onRunAgain} size="lg">
              <Play className="mr-2 h-5 w-5" />
              Run Again
            </Button>
          )}
          <Button onClick={onStop} variant="outline" size="lg">
            Exit
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Main Timer Display */}
      <Card>
        <CardContent className="pt-8 pb-6">
          <div className="text-center space-y-6">
            {/* Current Step */}
            {currentStep && (
              <div className="space-y-2">
                <Badge variant="secondary" className="text-sm">
                  Step {state.currentStepIndex + 1} of {state.totalSteps}
                </Badge>
                <div
                  className="text-2xl font-medium"
                  style={currentStep.color ? { color: currentStep.color } : undefined}
                >
                  {currentStep.label}
                </div>
              </div>
            )}
            
            {/* Countdown */}
            <div className="text-7xl font-bold tabular-nums tracking-tight">
              {formatTime(state.remainingMs)}
            </div>
            
            {/* Step Progress */}
            <div className="space-y-2">
              <Progress value={stepProgress} className="h-3" />
              <div className="text-sm text-muted-foreground">
                Step Progress
              </div>
            </div>
            
            {/* Next Step Preview */}
            {nextStep && (
              <div className="pt-4 border-t">
                <div className="text-sm text-muted-foreground mb-1">Next:</div>
                <div className="text-lg font-medium">{nextStep.label}</div>
                <div className="text-sm text-muted-foreground">
                  {formatTime(nextStep.durationMs)}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Routine Progress */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Routine Progress</span>
              <span className="font-medium">
                {state.currentStepIndex + 1} / {state.totalSteps}
              </span>
            </div>
            <Progress value={routineProgress} />
          </div>
        </CardContent>
      </Card>
      
      {/* Controls */}
      <Card>
        <CardContent className="pt-6 pb-6">
          <div className="space-y-4">
            {/* Primary Control */}
            <div className="flex justify-center">
              {!state.isRunning && !state.isPaused && (
                <Button onClick={onStart} size="lg" className="w-full max-w-xs">
                  <Play className="mr-2 h-5 w-5" />
                  Start
                </Button>
              )}
              
              {state.isRunning && (
                <Button onClick={onPause} size="lg" className="w-full max-w-xs">
                  <Pause className="mr-2 h-5 w-5" />
                  Pause
                </Button>
              )}
              
              {state.isPaused && (
                <Button onClick={onResume} size="lg" className="w-full max-w-xs">
                  <Play className="mr-2 h-5 w-5" />
                  Resume
                </Button>
              )}
            </div>
            
            {/* Secondary Controls */}
            {(state.isRunning || state.isPaused) && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={onPrevious}
                    variant="outline"
                    disabled={state.currentStepIndex === 0}
                  >
                    <SkipBack className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  <Button onClick={onSkip} variant="outline">
                    <SkipForward className="mr-2 h-4 w-4" />
                    Skip
                  </Button>
                </div>
                
                {/* Tertiary Controls */}
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={onAddTenSeconds} variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    +10s
                  </Button>
                  <Button onClick={onRestartStep} variant="outline" size="sm">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Restart Step
                  </Button>
                </div>
                
                {/* Stop Button */}
                <Button
                  onClick={onStop}
                  variant="destructive"
                  className="w-full"
                  size="sm"
                >
                  <Square className="mr-2 h-4 w-4" />
                  Stop Timer
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
