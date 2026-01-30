// Audio Engine - Web Audio API beeps and SpeechSynthesis voice
import type { SoundProfile } from "@/types";

/**
 * Audio Engine for timer sounds
 * Uses Web Audio API for beeps and SpeechSynthesis for voice
 */
export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterVolume: number = 70; // 0-100
  private isMuted: boolean = false;
  private isInitialized: boolean = false;
  
  /**
   * Initialize the audio context (must be called on user gesture)
   */
  initialize(): void {
    if (this.isInitialized) return;
    
    try {
      // Create AudioContext (must be on user gesture)
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.isInitialized = true;
      console.log("Audio engine initialized");
    } catch (error) {
      console.error("Failed to initialize audio engine:", error);
    }
  }
  
  /**
   * Play a beep sound
   */
  beep(frequency: number = 800, durationMs: number = 150): void {
    if (!this.isInitialized || !this.audioContext || this.isMuted || this.masterVolume === 0) {
      return;
    }
    
    try {
      const now = this.audioContext.currentTime;
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Configure oscillator
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, now);
      
      // Configure gain (volume)
      const volume = (this.masterVolume / 100) * 0.3; // Scale down to prevent distortion
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + 0.01); // Quick fade in
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000); // Fade out
      
      // Start and stop
      oscillator.start(now);
      oscillator.stop(now + durationMs / 1000);
    } catch (error) {
      console.error("Failed to play beep:", error);
    }
  }
  
  /**
   * Play countdown beep (different tones for different seconds)
   */
  countdownBeep(secondsRemaining: number): void {
    if (secondsRemaining === 3) {
      this.beep(600, 150); // Lower tone
    } else if (secondsRemaining === 2) {
      this.beep(700, 150); // Medium tone
    } else if (secondsRemaining === 1) {
      this.beep(900, 200); // Higher tone, longer
    } else {
      this.beep(650, 100); // Generic countdown beep
    }
  }
  
  /**
   * Play completion tone (celebratory sequence)
   */
  completionTone(): void {
    if (!this.isInitialized || this.isMuted || this.masterVolume === 0) {
      return;
    }
    
    // Play a celebratory sequence
    setTimeout(() => this.beep(523, 150), 0);    // C5
    setTimeout(() => this.beep(659, 150), 150);  // E5
    setTimeout(() => this.beep(784, 200), 300);  // G5
    setTimeout(() => this.beep(1047, 300), 500); // C6
  }
  
  /**
   * Speak text using SpeechSynthesis API
   */
  speak(text: string): void {
    if (this.isMuted || this.masterVolume === 0) {
      return;
    }
    
    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = this.masterVolume / 100;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Failed to speak:", error);
    }
  }
  
  /**
   * Set master volume (0-100)
   */
  setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(100, volume));
  }
  
  /**
   * Mute all sounds
   */
  mute(): void {
    this.isMuted = true;
    window.speechSynthesis.cancel();
  }
  
  /**
   * Unmute sounds
   */
  unmute(): void {
    this.isMuted = false;
  }
  
  /**
   * Check if initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }
  
  /**
   * Cleanup
   */
  dispose(): void {
    window.speechSynthesis.cancel();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.isInitialized = false;
  }
}

/**
 * Sound Manager for handling timer sound triggers
 * Manages timing and deduplication of sound events
 */
export class SoundManager {
  private audioEngine: AudioEngine;
  private lastWarningSecond: number = -1;
  private hasPlayedStepStart: boolean = false;
  
  constructor(audioEngine: AudioEngine) {
    this.audioEngine = audioEngine;
  }
  
  /**
   * Handle step start sound
   */
  onStepStart(
    stepLabel: string,
    soundProfile: SoundProfile,
    startSound: boolean,
    voiceText?: string
  ): void {
    if (this.hasPlayedStepStart) return;
    this.hasPlayedStepStart = true;
    this.lastWarningSecond = -1; // Reset warning tracker
    
    if (startSound) {
      this.audioEngine.beep(700, 100);
    }
    
    if (soundProfile === "BEEP+VOICE") {
      const textToSpeak = voiceText || stepLabel;
      setTimeout(() => {
        this.audioEngine.speak(textToSpeak);
      }, 200); // Small delay after beep
    }
  }
  
  /**
   * Handle warning countdown
   */
  onWarning(
    secondsRemaining: number,
    warningCountdown: number,
    soundProfile: SoundProfile
  ): void {
    if (soundProfile === "OFF") return;
    if (warningCountdown === 0) return;
    if (secondsRemaining > warningCountdown) return;
    if (secondsRemaining === this.lastWarningSecond) return; // Prevent duplicates
    
    this.lastWarningSecond = secondsRemaining;
    this.audioEngine.countdownBeep(secondsRemaining);
  }
  
  /**
   * Handle step end sound
   */
  onStepEnd(endSound: boolean): void {
    if (endSound) {
      this.audioEngine.beep(900, 150);
    }
  }
  
  /**
   * Handle step change (moving to next step)
   */
  onStepChange(stepChangeSound: boolean): void {
    this.hasPlayedStepStart = false; // Reset for next step
    
    if (stepChangeSound) {
      this.audioEngine.beep(800, 100);
    }
  }
  
  /**
   * Handle completion
   */
  onComplete(soundProfile: SoundProfile): void {
    if (soundProfile === "OFF") return;
    
    this.audioEngine.completionTone();
    
    if (soundProfile === "BEEP+VOICE") {
      setTimeout(() => {
        this.audioEngine.speak("Timer complete!");
      }, 800);
    }
  }
  
  /**
   * Reset state (for new timer run)
   */
  reset(): void {
    this.lastWarningSecond = -1;
    this.hasPlayedStepStart = false;
  }
}
