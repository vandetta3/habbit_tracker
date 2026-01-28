import { STATIC_QUOTES } from "./constants";
import { getTodayString } from "./date-utils";

interface Quote {
  quote: string;
  author: string;
}

/**
 * Fetch quote from ZenQuotes API with fallback to static quotes
 */
export async function fetchDailyQuote(): Promise<Quote> {
  try {
    const response = await fetch("https://zenquotes.io/api/today", {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error("Failed to fetch from ZenQuotes");
    }

    const data = await response.json();
    
    if (data && data[0]) {
      return {
        quote: data[0].q,
        author: data[0].a,
      };
    }

    throw new Error("Invalid response from ZenQuotes");
  } catch (error) {
    console.warn("Failed to fetch quote from ZenQuotes, using static fallback:", error);
    return getRandomStaticQuote();
  }
}

/**
 * Get a random quote from static fallback list
 * Uses date as seed to ensure same quote throughout the day
 */
export function getRandomStaticQuote(): Quote {
  const today = getTodayString();
  const seed = hashString(today);
  const index = seed % STATIC_QUOTES.length;
  
  return STATIC_QUOTES[index];
}

/**
 * Simple string hash function for deterministic "random" selection
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}
