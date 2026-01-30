"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/instant";
import { useToast } from "@/components/ui/toast";
import { TimerRunnerDisplay } from "@/components/timers/TimerRunnerDisplay";
import { buildTimeline, TimerRunner } from "@/lib/timer-engine";
import { AudioEngine, SoundManager } from "@/lib/audio-engine";
import { getMergedSoundSettings } from "@/lib/sound-manager";
import type { Timer, TimerStep, TimerGroup, TimerSoundSettings, UserSoundPreferences, TimerRunState, PlayableStep } from "@/types";
import confetti from "canvas-confetti";

export default function TimerRunPage() {
  const router = useRouter();
  const params = useParams();
  const timerId = params.id as string;
  const { addToast } = useToast();
  const { user } = db.useAuth();

  // Audio and timer instances
  const audioEngineRef = useRef<AudioEngine | null>(null);
  const soundManagerRef = useRef<SoundManager | null>(null);
  const timerRunnerRef = useRef<TimerRunner | null>(null);

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [timerState, setTimerState] = useState<TimerRunState | null>(null);
  const [currentStep, setCurrentStep] = useState<PlayableStep | null>(null);
  const [nextStep, setNextStep] = useState<PlayableStep | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Query timer data
  const { data, isLoading: isQueryLoading } = db.useQuery({
    timers: {
      $: {
        where: {
          id: timerId,
          user: user?.id || "",
        },
      },
      steps: {},
      groups: {},
      soundSettings: {},
    },
    userSoundPreferences: {
      $: {
        where: {
          user: user?.id || "",
        },
      },
    },
  });

  const timer = (data?.timers?.[0] || null) as unknown as (Timer & {
    steps: TimerStep[];
    groups: TimerGroup[];
    soundSettings?: TimerSoundSettings;
  }) | null;

  const globalSoundPrefs = (data?.userSoundPreferences?.[0] || null) as unknown as UserSoundPreferences | null;

  // Initialize audio and timer
  useEffect(() => {
    if (!timer || isQueryLoading) return;

    try {
      // Initialize audio engine
      if (!audioEngineRef.current) {
        audioEngineRef.current = new AudioEngine();
        soundManagerRef.current = new SoundManager(audioEngineRef.current);
      }

      // Build timeline
      const timeline = buildTimeline(timer, timer.steps, timer.groups);
      
      if (timeline.length === 0) {
        addToast("Timer has no steps", "error");
        router.push("/timers");
        return;
      }

      // Get merged sound settings
      const mergedSettings = getMergedSoundSettings(
        globalSoundPrefs,
        timer.soundSettings
      );

      // Set volume
      audioEngineRef.current.setVolume(mergedSettings.volume);

      if (mergedSettings.soundProfile === "OFF") {
        audioEngineRef.current.mute();
      }

      // Create timer runner
      timerRunnerRef.current = new TimerRunner(timeline, {
        onTick: (state) => {
          setTimerState(state);
        },
        onStepChange: (stepIndex, step) => {
          setCurrentStep(step);
          setNextStep(timerRunnerRef.current?.getNextStep() || null);

          // Play step change sound
          if (soundManagerRef.current) {
            soundManagerRef.current.onStepChange(mergedSettings.stepChangeSound);
            soundManagerRef.current.onStepStart(
              step.label,
              mergedSettings.soundProfile,
              mergedSettings.startSound
            );
          }
        },
        onWarning: (secondsRemaining) => {
          if (soundManagerRef.current) {
            soundManagerRef.current.onWarning(
              secondsRemaining,
              mergedSettings.warningCountdown,
              mergedSettings.soundProfile
            );
          }
        },
        onComplete: () => {
          setIsCompleted(true);
          if (soundManagerRef.current) {
            soundManagerRef.current.onComplete(mergedSettings.soundProfile);
          }
          // Trigger confetti
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        },
      });

      // Initialize state
      const initialState = timerRunnerRef.current.getState();
      setTimerState(initialState);
      setCurrentStep(timerRunnerRef.current.getCurrentStep());
      setNextStep(timerRunnerRef.current.getNextStep());
      setIsLoading(false);
    } catch (error) {
      console.error("Error initializing timer:", error);
      addToast("Failed to initialize timer", "error");
      router.push("/timers");
    }

    // Cleanup
    return () => {
      if (timerRunnerRef.current) {
        timerRunnerRef.current.stop();
      }
      if (audioEngineRef.current) {
        audioEngineRef.current.dispose();
      }
    };
  }, [timer, isQueryLoading, globalSoundPrefs, addToast, router]);

  const handleStart = () => {
    if (!timerRunnerRef.current || !audioEngineRef.current) return;

    // Initialize audio on user gesture
    if (!audioEngineRef.current.isReady()) {
      audioEngineRef.current.initialize();
    }

    timerRunnerRef.current.start();
    soundManagerRef.current?.reset();
  };

  const handlePause = () => {
    timerRunnerRef.current?.pause();
  };

  const handleResume = () => {
    timerRunnerRef.current?.resume();
  };

  const handleSkip = () => {
    timerRunnerRef.current?.skip();
  };

  const handlePrevious = () => {
    timerRunnerRef.current?.previous();
  };

  const handleAddTenSeconds = () => {
    timerRunnerRef.current?.addTenSeconds();
  };

  const handleRestartStep = () => {
    timerRunnerRef.current?.restartStep();
  };

  const handleStop = () => {
    timerRunnerRef.current?.stop();
    router.push("/timers");
  };

  const handleRunAgain = () => {
    setIsCompleted(false);
    soundManagerRef.current?.reset();
    handleStart();
  };

  if (isQueryLoading || isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/timers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!timer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/timers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Timer Not Found</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/timers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{timer.name}</h1>
          {timer.description && (
            <p className="text-sm text-muted-foreground">{timer.description}</p>
          )}
        </div>
      </div>

      {/* Timer Runner */}
      {timerState && (
        <TimerRunnerDisplay
          state={timerState}
          currentStep={currentStep}
          nextStep={nextStep}
          onStart={handleStart}
          onPause={handlePause}
          onResume={handleResume}
          onSkip={handleSkip}
          onPrevious={handlePrevious}
          onAddTenSeconds={handleAddTenSeconds}
          onRestartStep={handleRestartStep}
          onStop={handleStop}
          isCompleted={isCompleted}
          onRunAgain={handleRunAgain}
        />
      )}
    </div>
  );
}
