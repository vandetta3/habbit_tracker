// Sound Manager - Merge global and per-timer sound settings
import type { UserSoundPreferences, TimerSoundSettings, MergedSoundSettings, SoundProfile } from "@/types";

/**
 * Default sound preferences for new users
 */
export const DEFAULT_SOUND_PREFERENCES: Omit<UserSoundPreferences, "id" | "userId" | "updatedAt"> = {
  soundProfile: "BEEP",
  warningCountdown: 3,
  startSound: true,
  endSound: true,
  stepChangeSound: true,
  volume: 70,
};

/**
 * Merge global user sound preferences with per-timer overrides
 * Timer settings override global settings when present
 */
export function getMergedSoundSettings(
  globalPrefs: UserSoundPreferences | null | undefined,
  timerSettings: TimerSoundSettings | null | undefined
): MergedSoundSettings {
  // Use defaults if no global prefs exist
  const basePrefs = globalPrefs || {
    ...DEFAULT_SOUND_PREFERENCES,
    id: "",
    userId: "",
    updatedAt: Date.now(),
  };
  
  // If no timer-specific settings, use global
  if (!timerSettings) {
    return {
      soundProfile: basePrefs.soundProfile,
      warningCountdown: basePrefs.warningCountdown,
      startSound: basePrefs.startSound,
      endSound: basePrefs.endSound,
      stepChangeSound: basePrefs.stepChangeSound,
      volume: basePrefs.volume,
    };
  }
  
  // Merge: timer settings override global settings
  return {
    soundProfile: timerSettings.soundProfile ?? basePrefs.soundProfile,
    warningCountdown: timerSettings.warningCountdown ?? basePrefs.warningCountdown,
    startSound: timerSettings.startSound ?? basePrefs.startSound,
    endSound: timerSettings.endSound ?? basePrefs.endSound,
    stepChangeSound: timerSettings.stepChangeSound ?? basePrefs.stepChangeSound,
    volume: timerSettings.volume ?? basePrefs.volume,
  };
}

/**
 * Check if timer has custom sound settings
 */
export function hasCustomSoundSettings(timerSettings: TimerSoundSettings | null | undefined): boolean {
  if (!timerSettings) return false;
  
  return (
    timerSettings.soundProfile !== undefined ||
    timerSettings.warningCountdown !== undefined ||
    timerSettings.startSound !== undefined ||
    timerSettings.endSound !== undefined ||
    timerSettings.stepChangeSound !== undefined ||
    timerSettings.volume !== undefined
  );
}

/**
 * Validate sound profile
 */
export function isValidSoundProfile(profile: string): profile is SoundProfile {
  return profile === "OFF" || profile === "BEEP" || profile === "BEEP+VOICE";
}

/**
 * Validate warning countdown value
 */
export function isValidWarningCountdown(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 30;
}

/**
 * Validate volume value
 */
export function isValidVolume(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 100;
}
