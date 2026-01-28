import { format, startOfDay, subDays, isToday, isYesterday, parseISO } from "date-fns";

/**
 * Get the current date in YYYY-MM-DD format (local timezone)
 */
export function getTodayString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/**
 * Get yesterday's date in YYYY-MM-DD format
 */
export function getYesterdayString(): string {
  return format(subDays(new Date(), 1), "yyyy-MM-dd");
}

/**
 * Format a date string to YYYY-MM-DD
 */
export function formatDateString(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "yyyy-MM-dd");
}

/**
 * Check if a date string is today
 */
export function isDateToday(dateString: string): boolean {
  try {
    return isToday(parseISO(dateString));
  } catch {
    return false;
  }
}

/**
 * Check if a date string is yesterday
 */
export function isDateYesterday(dateString: string): boolean {
  try {
    return isYesterday(parseISO(dateString));
  } catch {
    return false;
  }
}

/**
 * Get the date N days before a given date
 */
export function getDateNDaysAgo(n: number, fromDate?: Date): string {
  const date = fromDate || new Date();
  return format(subDays(date, n), "yyyy-MM-dd");
}

/**
 * Get date range for last N days
 */
export function getLastNDays(n: number): string[] {
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    dates.push(getDateNDaysAgo(i));
  }
  return dates;
}

/**
 * Get previous day from a date string
 */
export function getPreviousDay(dateString: string): string {
  const date = parseISO(dateString);
  return format(subDays(date, 1), "yyyy-MM-dd");
}

/**
 * Compare two date strings
 */
export function compareDates(date1: string, date2: string): number {
  return date1.localeCompare(date2);
}

/**
 * Format date for display (e.g., "Jan 28, 2026")
 */
export function formatDateForDisplay(dateString: string): string {
  try {
    return format(parseISO(dateString), "MMM d, yyyy");
  } catch {
    return dateString;
  }
}

/**
 * Get user's timezone
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
