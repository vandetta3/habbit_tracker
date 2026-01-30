// Timer Engine - Drift-corrected timer logic
import type { Timer, TimerStep, TimerGroup, PlayableStep, TimerRunState } from "@/types";

/**
 * Builds a flat timeline of playable steps from timer, steps, and groups
 * Expands group repeats and routine repeats into a linear sequence
 */
export function buildTimeline(
  timer: Timer,
  steps: TimerStep[],
  groups: TimerGroup[]
): PlayableStep[] {
  const playableSteps: PlayableStep[] = [];
  
  // Sort steps by orderIndex
  const sortedSteps = [...steps].sort((a, b) => a.orderIndex - b.orderIndex);
  
  // Sort groups by orderIndex
  const sortedGroups = [...groups].sort((a, b) => a.orderIndex - b.orderIndex);
  
  // Build a map of groupId to group for quick lookup
  const groupMap = new Map(sortedGroups.map(g => [g.id, g]));
  
  // Separate steps into grouped and ungrouped
  const groupedSteps = new Map<string, TimerStep[]>();
  const ungroupedSteps: TimerStep[] = [];
  
  sortedSteps.forEach(step => {
    if (step.groupId) {
      if (!groupedSteps.has(step.groupId)) {
        groupedSteps.set(step.groupId, []);
      }
      groupedSteps.get(step.groupId)!.push(step);
    } else {
      ungroupedSteps.push(step);
    }
  });
  
  // Build the base sequence (one routine iteration)
  const baseSequence: PlayableStep[] = [];
  let currentStepIndex = 0;
  
  // Process steps and groups in order
  const processedGroups = new Set<string>();
  
  for (const step of sortedSteps) {
    if (step.groupId && !processedGroups.has(step.groupId)) {
      // This is the first step of a group - process the entire group with repeats
      const group = groupMap.get(step.groupId);
      if (group) {
        const stepsInGroup = groupedSteps.get(step.groupId) || [];
        // Repeat the group
        for (let i = 0; i < group.repeatCount; i++) {
          for (const groupStep of stepsInGroup) {
            baseSequence.push({
              stepId: groupStep.id,
              label: groupStep.label,
              durationMs: groupStep.durationMs,
              color: groupStep.color,
              originalIndex: currentStepIndex,
              iterationIndex: i,
            });
          }
        }
        processedGroups.add(step.groupId);
        currentStepIndex++;
      }
    } else if (!step.groupId) {
      // Ungrouped step - add once
      baseSequence.push({
        stepId: step.id,
        label: step.label,
        durationMs: step.durationMs,
        color: step.color,
        originalIndex: currentStepIndex,
        iterationIndex: 0,
      });
      currentStepIndex++;
    }
  }
  
  // Repeat the entire routine
  for (let routineIteration = 0; routineIteration < timer.repeatEntireRoutine; routineIteration++) {
    for (const playableStep of baseSequence) {
      playableSteps.push({
        ...playableStep,
        iterationIndex: routineIteration,
      });
    }
  }
  
  return playableSteps;
}

/**
 * Timer Runner - Manages timer execution with drift correction
 */
export class TimerRunner {
  private playableSteps: PlayableStep[];
  private currentStepIndex: number = 0;
  private remainingMs: number = 0;
  private stepStartTimestamp: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private lastWarningSecond: number = -1;
  
  private onTick: (state: TimerRunState) => void;
  private onStepChange: (stepIndex: number, step: PlayableStep) => void;
  private onWarning: (secondsRemaining: number) => void;
  private onComplete: () => void;
  
  constructor(
    playableSteps: PlayableStep[],
    callbacks: {
      onTick: (state: TimerRunState) => void;
      onStepChange: (stepIndex: number, step: PlayableStep) => void;
      onWarning: (secondsRemaining: number) => void;
      onComplete: () => void;
    }
  ) {
    this.playableSteps = playableSteps;
    this.onTick = callbacks.onTick;
    this.onStepChange = callbacks.onStepChange;
    this.onWarning = callbacks.onWarning;
    this.onComplete = callbacks.onComplete;
    
    if (playableSteps.length > 0) {
      this.remainingMs = playableSteps[0].durationMs;
    }
  }
  
  /**
   * Start the timer from the beginning
   */
  start(): void {
    if (this.playableSteps.length === 0) return;
    
    this.isRunning = true;
    this.isPaused = false;
    this.currentStepIndex = 0;
    this.remainingMs = this.playableSteps[0].durationMs;
    this.stepStartTimestamp = Date.now();
    this.lastWarningSecond = -1;
    
    this.onStepChange(this.currentStepIndex, this.playableSteps[this.currentStepIndex]);
    this.startInterval();
  }
  
  /**
   * Pause the timer
   */
  pause(): void {
    if (!this.isRunning || this.isPaused) return;
    
    this.isPaused = true;
    this.isRunning = false;
    
    // Calculate accurate remaining time based on timestamp
    const elapsed = Date.now() - this.stepStartTimestamp;
    this.remainingMs = Math.max(0, this.remainingMs - elapsed);
    
    this.stopInterval();
    this.emitTick();
  }
  
  /**
   * Resume from paused state
   */
  resume(): void {
    if (!this.isPaused) return;
    
    this.isPaused = false;
    this.isRunning = true;
    this.stepStartTimestamp = Date.now();
    this.lastWarningSecond = -1;
    
    this.startInterval();
  }
  
  /**
   * Skip to the next step
   */
  skip(): void {
    if (this.currentStepIndex >= this.playableSteps.length - 1) {
      // Last step - complete the timer
      this.complete();
      return;
    }
    
    this.currentStepIndex++;
    this.remainingMs = this.playableSteps[this.currentStepIndex].durationMs;
    this.stepStartTimestamp = Date.now();
    this.lastWarningSecond = -1;
    
    this.onStepChange(this.currentStepIndex, this.playableSteps[this.currentStepIndex]);
    this.emitTick();
  }
  
  /**
   * Go back to the previous step
   */
  previous(): void {
    if (this.currentStepIndex <= 0) return;
    
    this.currentStepIndex--;
    this.remainingMs = this.playableSteps[this.currentStepIndex].durationMs;
    this.stepStartTimestamp = Date.now();
    this.lastWarningSecond = -1;
    
    this.onStepChange(this.currentStepIndex, this.playableSteps[this.currentStepIndex]);
    this.emitTick();
  }
  
  /**
   * Add 10 seconds to the current step
   */
  addTenSeconds(): void {
    this.remainingMs += 10000;
    this.stepStartTimestamp = Date.now();
    this.emitTick();
  }
  
  /**
   * Restart the current step
   */
  restartStep(): void {
    this.remainingMs = this.playableSteps[this.currentStepIndex].durationMs;
    this.stepStartTimestamp = Date.now();
    this.lastWarningSecond = -1;
    this.emitTick();
  }
  
  /**
   * Stop the timer completely
   */
  stop(): void {
    this.isRunning = false;
    this.isPaused = false;
    this.stopInterval();
  }
  
  /**
   * Get the current state
   */
  getState(): TimerRunState {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      currentStepIndex: this.currentStepIndex,
      remainingMs: this.remainingMs,
      stepStartTimestamp: this.stepStartTimestamp,
      totalSteps: this.playableSteps.length,
    };
  }
  
  /**
   * Get the current step
   */
  getCurrentStep(): PlayableStep | null {
    if (this.currentStepIndex >= 0 && this.currentStepIndex < this.playableSteps.length) {
      return this.playableSteps[this.currentStepIndex];
    }
    return null;
  }
  
  /**
   * Get the next step
   */
  getNextStep(): PlayableStep | null {
    const nextIndex = this.currentStepIndex + 1;
    if (nextIndex < this.playableSteps.length) {
      return this.playableSteps[nextIndex];
    }
    return null;
  }
  
  /**
   * Start the interval for updating the timer
   */
  private startInterval(): void {
    this.stopInterval();
    
    this.intervalId = setInterval(() => {
      this.tick();
    }, 200); // Update every 200ms for smooth UI
    
    // Emit immediately
    this.tick();
  }
  
  /**
   * Stop the interval
   */
  private stopInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  /**
   * Tick function - computes remaining time and handles step transitions
   */
  private tick(): void {
    if (!this.isRunning) return;
    
    // Calculate remaining time based on timestamp (drift correction)
    const elapsed = Date.now() - this.stepStartTimestamp;
    const currentRemaining = Math.max(0, this.remainingMs - elapsed);
    
    // Check for warning seconds
    const secondsRemaining = Math.ceil(currentRemaining / 1000);
    if (secondsRemaining <= 30 && secondsRemaining > 0 && secondsRemaining !== this.lastWarningSecond) {
      this.lastWarningSecond = secondsRemaining;
      this.onWarning(secondsRemaining);
    }
    
    // Check if step is complete
    if (currentRemaining <= 0) {
      // Step completed
      if (this.currentStepIndex >= this.playableSteps.length - 1) {
        // Last step - complete the timer
        this.complete();
        return;
      } else {
        // Move to next step
        this.currentStepIndex++;
        this.remainingMs = this.playableSteps[this.currentStepIndex].durationMs;
        this.stepStartTimestamp = Date.now();
        this.lastWarningSecond = -1;
        
        this.onStepChange(this.currentStepIndex, this.playableSteps[this.currentStepIndex]);
      }
    }
    
    this.emitTick();
  }
  
  /**
   * Emit tick event with current state
   */
  private emitTick(): void {
    // Calculate current remaining based on timestamp
    let currentRemaining: number;
    if (this.isPaused) {
      currentRemaining = this.remainingMs;
    } else if (this.isRunning) {
      const elapsed = Date.now() - this.stepStartTimestamp;
      currentRemaining = Math.max(0, this.remainingMs - elapsed);
    } else {
      currentRemaining = this.remainingMs;
    }
    
    this.onTick({
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      currentStepIndex: this.currentStepIndex,
      remainingMs: currentRemaining,
      stepStartTimestamp: this.stepStartTimestamp,
      totalSteps: this.playableSteps.length,
    });
  }
  
  /**
   * Complete the timer
   */
  private complete(): void {
    this.isRunning = false;
    this.isPaused = false;
    this.stopInterval();
    this.onComplete();
  }
}

/**
 * Format milliseconds to MM:SS or HH:MM:SS
 */
export function formatTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Parse MM:SS or HH:MM:SS format to milliseconds
 */
export function parseTimeToMs(timeString: string): number {
  const parts = timeString.split(':').map(p => parseInt(p, 10));
  
  if (parts.length === 2) {
    // MM:SS
    const [minutes, seconds] = parts;
    return (minutes * 60 + seconds) * 1000;
  } else if (parts.length === 3) {
    // HH:MM:SS
    const [hours, minutes, seconds] = parts;
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  }
  
  return 0;
}

/**
 * Calculate total duration of all steps
 */
export function calculateTotalDuration(steps: PlayableStep[]): number {
  return steps.reduce((total, step) => total + step.durationMs, 0);
}
