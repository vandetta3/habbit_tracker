// Nutrition utility functions
import type { NutritionEntry, TimeRange, NutritionAnalytics } from "@/types";
import { getTodayString } from "./date-utils";

/**
 * Calculate total weight change from entries
 */
export function calculateWeightChange(entries: NutritionEntry[]): number {
  if (entries.length === 0) return 0;
  
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const firstWeight = sorted[0].bodyWeight;
  const lastWeight = sorted[sorted.length - 1].bodyWeight;
  
  return lastWeight - firstWeight;
}

/**
 * Calculate weekly average for a specific metric
 */
export function calculateWeeklyAverage(
  entries: NutritionEntry[],
  metric: keyof Pick<NutritionEntry, 'bodyWeight' | 'caloriesIntake' | 'proteinIntake' | 'waterIntake' | 'sleepHours'>
): number {
  if (entries.length === 0) return 0;
  
  const sum = entries.reduce((acc, entry) => acc + entry[metric], 0);
  return sum / entries.length;
}

/**
 * Calculate calorie adherence percentage (days meeting target within 10%)
 */
export function calculateCalorieAdherence(
  entries: NutritionEntry[],
  target: number
): number {
  if (entries.length === 0 || target === 0) return 0;
  
  const withinTarget = entries.filter(entry => {
    const diff = Math.abs(entry.caloriesIntake - target);
    const percentage = (diff / target) * 100;
    return percentage <= 10; // Within 10% of target
  });
  
  return Math.round((withinTarget.length / entries.length) * 100);
}

/**
 * Calculate protein consistency score (0-100)
 */
export function calculateProteinConsistency(
  entries: NutritionEntry[],
  target: number
): number {
  if (entries.length === 0 || target === 0) return 0;
  
  // Calculate how many days met at least 80% of protein target
  const meetingTarget = entries.filter(entry => {
    return entry.proteinIntake >= (target * 0.8);
  });
  
  return Math.round((meetingTarget.length / entries.length) * 100);
}

/**
 * Filter entries by date range
 */
export function filterEntriesByDateRange(
  entries: NutritionEntry[],
  range: TimeRange,
  customDates?: { start: string; end: string }
): NutritionEntry[] {
  const today = new Date();
  let startDate: Date;
  
  switch (range) {
    case 'week':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 1);
      break;
    case '3months':
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 3);
      break;
    case '6months':
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 6);
      break;
    case 'custom':
      if (!customDates) return entries;
      return entries.filter(entry => {
        return entry.date >= customDates.start && entry.date <= customDates.end;
      });
    default:
      return entries;
  }
  
  const startDateString = startDate.toISOString().split('T')[0];
  return entries.filter(entry => entry.date >= startDateString);
}

/**
 * Get weight trend direction
 */
export function getWeightTrend(entries: NutritionEntry[]): 'gain' | 'loss' | 'stable' {
  const change = calculateWeightChange(entries);
  
  if (Math.abs(change) < 0.5) return 'stable';
  return change > 0 ? 'gain' : 'loss';
}

/**
 * Get ISO week number for a date
 */
export function getISOWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNumber = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNumber;
}

/**
 * Compress image from Base64 string
 */
export async function compressImage(
  base64: string,
  maxWidth: number = 800,
  quality: number = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = base64;
  });
}

/**
 * Calculate comprehensive nutrition analytics
 */
export function calculateNutritionAnalytics(
  entries: NutritionEntry[],
  profile?: { dailyCalorieTarget: number; dailyProteinTarget: number }
): NutritionAnalytics {
  if (entries.length === 0) {
    return {
      weightChange: 0,
      avgCalories: 0,
      avgProtein: 0,
      avgWater: 0,
      avgSleep: 0,
      calorieAdherence: 0,
      proteinConsistency: 0,
      startWeight: 0,
      currentWeight: 0,
      weeklyAvgWeight: 0,
    };
  }
  
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  
  return {
    weightChange: calculateWeightChange(entries),
    avgCalories: Math.round(calculateWeeklyAverage(entries, 'caloriesIntake')),
    avgProtein: Math.round(calculateWeeklyAverage(entries, 'proteinIntake')),
    avgWater: parseFloat(calculateWeeklyAverage(entries, 'waterIntake').toFixed(1)),
    avgSleep: parseFloat(calculateWeeklyAverage(entries, 'sleepHours').toFixed(1)),
    calorieAdherence: profile ? calculateCalorieAdherence(entries, profile.dailyCalorieTarget) : 0,
    proteinConsistency: profile ? calculateProteinConsistency(entries, profile.dailyProteinTarget) : 0,
    startWeight: sorted[0].bodyWeight,
    currentWeight: sorted[sorted.length - 1].bodyWeight,
    weeklyAvgWeight: parseFloat(calculateWeeklyAverage(entries, 'bodyWeight').toFixed(1)),
  };
}

/**
 * Get date range strings for time range
 */
export function getDateRangeForTimeRange(range: TimeRange): { start: string; end: string } {
  const today = new Date();
  const endDate = getTodayString();
  let startDate: Date;
  
  switch (range) {
    case 'week':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 1);
      break;
    case '3months':
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 3);
      break;
    case '6months':
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 6);
      break;
    default:
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 1);
  }
  
  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate,
  };
}

/**
 * Get week start date from week number and year
 */
export function getWeekStartDate(weekNumber: number, year: number): string {
  const simple = new Date(year, 0, 1 + (weekNumber - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  
  if (dow <= 4) {
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  } else {
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  }
  
  return ISOweekStart.toISOString().split('T')[0];
}

/**
 * Check if entry exists for a given date
 */
export function hasEntryForDate(entries: NutritionEntry[], date: string): boolean {
  return entries.some(entry => entry.date === date);
}

/**
 * Get entry for specific date
 */
export function getEntryForDate(entries: NutritionEntry[], date: string): NutritionEntry | undefined {
  return entries.find(entry => entry.date === date);
}
