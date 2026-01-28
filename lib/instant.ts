// InstantDB Client Setup
import { init } from "@instantdb/react";
import schema from "@/instant.schema";

// Initialize InstantDB with schema
// Get your App ID from https://instantdb.com/dash
const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID || "";

if (!APP_ID) {
  console.warn("⚠️ NEXT_PUBLIC_INSTANT_APP_ID not set. Please add it to .env.local");
}

export const db = init({
  appId: APP_ID,
  
});

// Export types for type safety
export type Schema = typeof schema;
