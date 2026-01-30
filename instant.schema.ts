// InstantDB Schema Definition
// Documentation: https://instantdb.com/docs/modeling-data

import { i } from "@instantdb/react";

const graph = i.graph(
  {
    // Users entity (managed by InstantDB auth)
    users: i.entity({
      email: i.string(),
      createdAt: i.number(),
    }),

    // Habits
    habits: i.entity({
      title: i.string(),
      description: i.string().optional(),
      frequency: i.string(), // 'daily' | 'weekly' | 'custom'
      customDays: i.json().optional(), // Array of numbers 0-6
      startDate: i.string(), // YYYY-MM-DD
      when: i.string().optional(), // Time in 24hr format (HH:MM)
      where: i.string().optional(), // Location/place
      isActive: i.boolean(),
      color: i.string(),
      icon: i.string(),
      user: i.string(),
      createdAt: i.number(),
      updatedAt: i.number(),
    }),

    // Habit Completions
    habitCompletions: i.entity({
      completedDate: i.string(), // YYYY-MM-DD
      completedAt: i.number(),
    }),

    // Todos
    todos: i.entity({
      title: i.string(),
      description: i.string().optional(),
      status: i.string(), // 'pending' | 'done'
      dueDate: i.string().optional(), // YYYY-MM-DD
      dueTime: i.string().optional(), // HH:MM in 24hr format
      priority: i.string(), // 'low' | 'medium' | 'high'
      createdAt: i.number(),
      completedAt: i.number().optional(),
    }),

    // Notes
    notes: i.entity({
      title: i.string(),
      content: i.string(),
      tags: i.json().optional(), // Array of strings
      isPinned: i.boolean(),
      createdAt: i.number(),
      updatedAt: i.number(),
    }),

    // Daily Quotes (cache)
    dailyQuotes: i.entity({
      date: i.string(), // YYYY-MM-DD
      quote: i.string(),
      author: i.string(),
      fetchedAt: i.number(),
    }),

    // Expenses
    expenses: i.entity({
      title: i.string(),
      amount: i.number(), // Stored in paise/cents for precision
      currency: i.string(), // 'INR'
      date: i.string(), // YYYY-MM-DD
      category: i.string(), // ExpenseCategory enum
      paymentMode: i.string(), // 'Cash' | 'Card' | 'UPI' | 'Wallet'
      merchant: i.string().optional(),
      notes: i.string().optional(),
      // Behavioral tracking
      necessityLevel: i.string(), // 'necessary' | 'avoidable' | 'optional' | 'luxury'
      savingsPotential: i.string(), // 'none' | 'low' | 'medium' | 'high'
      wasteFlag: i.boolean(),
      valueScore: i.number(), // 1-5
      emotionTag: i.string(), // 'neutral' | 'happy' | 'stress' | 'impulse' | 'celebration' | 'regret'
      expenseIntent: i.string(), // 'survival' | 'comfort' | 'growth' | 'social' | 'entertainment' | 'status'
      // Lifecycle
      isRecurring: i.boolean(),
      recurringType: i.string().optional(), // 'monthly' | 'yearly'
      deletedAt: i.number().optional(), // Soft delete timestamp
      createdAt: i.number(),
      updatedAt: i.number(),
    }),

    // Timers
    timers: i.entity({
      name: i.string(),
      description: i.string().optional(),
      tags: i.json().optional(), // Array of strings
      repeatEntireRoutine: i.number(),
      createdAt: i.number(),
      updatedAt: i.number(),
    }),

    // Timer Steps
    timerSteps: i.entity({
      label: i.string(),
      durationMs: i.number(),
      orderIndex: i.number(),
      type: i.string(), // 'countdown'
      color: i.string().optional(),
      groupId: i.string().optional(),
      createdAt: i.number(),
    }),

    // Timer Groups
    timerGroups: i.entity({
      name: i.string().optional(),
      repeatCount: i.number(),
      orderIndex: i.number(),
      createdAt: i.number(),
    }),

    // User Sound Preferences (global defaults)
    userSoundPreferences: i.entity({
      soundProfile: i.string(), // 'OFF' | 'BEEP' | 'BEEP+VOICE'
      warningCountdown: i.number(), // 0=OFF, or 1-30 seconds
      startSound: i.boolean(),
      endSound: i.boolean(),
      stepChangeSound: i.boolean(),
      volume: i.number(), // 0-100
      updatedAt: i.number(),
    }),

    // Timer Sound Settings (per-timer overrides)
    timerSoundSettings: i.entity({
      soundProfile: i.string().optional(),
      warningCountdown: i.number().optional(),
      startSound: i.boolean().optional(),
      endSound: i.boolean().optional(),
      stepChangeSound: i.boolean().optional(),
      volume: i.number().optional(),
      voiceText: i.string().optional(), // max 120 chars
      createdAt: i.number(),
      updatedAt: i.number(),
    }),
  },
  {
    // Define relationships between entities
    habitsByUser: {
      forward: {
        on: "habits",
        has: "one",
        label: "user",
      },
      reverse: {
        on: "users",
        has: "many",
        label: "habits",
      },
    },
    completionsByHabit: {
      forward: {
        on: "habitCompletions",
        has: "one",
        label: "habit",
      },
      reverse: {
        on: "habits",
        has: "many",
        label: "completions",
      },
    },
    completionsByUser: {
      forward: {
        on: "habitCompletions",
        has: "one",
        label: "user",
      },
      reverse: {
        on: "users",
        has: "many",
        label: "habitCompletions",
      },
    },
    todosByUser: {
      forward: {
        on: "todos",
        has: "one",
        label: "user",
      },
      reverse: {
        on: "users",
        has: "many",
        label: "todos",
      },
    },
    notesByUser: {
      forward: {
        on: "notes",
        has: "one",
        label: "user",
      },
      reverse: {
        on: "users",
        has: "many",
        label: "notes",
      },
    },
    quotesByUser: {
      forward: {
        on: "dailyQuotes",
        has: "one",
        label: "user",
      },
      reverse: {
        on: "users",
        has: "many",
        label: "dailyQuotes",
      },
    },
    expensesByUser: {
      forward: {
        on: "expenses",
        has: "one",
        label: "user",
      },
      reverse: {
        on: "users",
        has: "many",
        label: "expenses",
      },
    },
    timersByUser: {
      forward: {
        on: "timers",
        has: "one",
        label: "user",
      },
      reverse: {
        on: "users",
        has: "many",
        label: "timers",
      },
    },
    stepsByTimer: {
      forward: {
        on: "timerSteps",
        has: "one",
        label: "timer",
      },
      reverse: {
        on: "timers",
        has: "many",
        label: "steps",
      },
    },
    groupsByTimer: {
      forward: {
        on: "timerGroups",
        has: "one",
        label: "timer",
      },
      reverse: {
        on: "timers",
        has: "many",
        label: "groups",
      },
    },
    stepsInGroup: {
      forward: {
        on: "timerSteps",
        has: "one",
        label: "group",
      },
      reverse: {
        on: "timerGroups",
        has: "many",
        label: "stepsInGroup",
      },
    },
    soundPrefsByUser: {
      forward: {
        on: "userSoundPreferences",
        has: "one",
        label: "user",
      },
      reverse: {
        on: "users",
        has: "one",
        label: "soundPreferences",
      },
    },
    soundSettingsByTimer: {
      forward: {
        on: "timerSoundSettings",
        has: "one",
        label: "timer",
      },
      reverse: {
        on: "timers",
        has: "one",
        label: "soundSettings",
      },
    },
  }
);

export default graph;
