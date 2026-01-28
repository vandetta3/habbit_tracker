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
      isActive: i.boolean(),
      color: i.string(),
      icon: i.string(),
      createdAt: i.number(),
      updatedAt: i.number(),
    }),

    // Habit Completions
    habitCompletions: i.entity({
      completedDate: i.string(), // YYYY-MM-DD
      completedAt: i.number(),
    }),

    // Milestones/Achievements
    milestones: i.entity({
      milestoneType: i.string(), // 'streak' | 'total_completions' | 'consistency' | 'comeback' | 'global'
      milestoneKey: i.string(), // e.g., 'streak_7', 'total_100'
      value: i.number(),
      earnedAt: i.number(),
      viewedAt: i.number().optional(),
    }),

    // Todos
    todos: i.entity({
      title: i.string(),
      status: i.string(), // 'pending' | 'done'
      dueDate: i.string().optional(), // YYYY-MM-DD
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
    milestonesByHabit: {
      forward: {
        on: "milestones",
        has: "one",
        label: "habit",
      },
      reverse: {
        on: "habits",
        has: "many",
        label: "milestones",
      },
    },
    milestonesByUser: {
      forward: {
        on: "milestones",
        has: "one",
        label: "user",
      },
      reverse: {
        on: "users",
        has: "many",
        label: "milestones",
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
  }
);

export default graph;
