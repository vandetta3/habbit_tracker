import { z } from "zod";

// Habit validation schema
export const HabitSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(50, "Title must be less than 50 characters"),
  description: z.string().max(200, "Description must be less than 200 characters").optional(),
  frequency: z.enum(["daily", "weekly", "custom"]),
  customDays: z.array(z.number().min(0).max(6)).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  color: z.string(),
  icon: z.string(),
  isActive: z.boolean().default(true),
});

export type HabitFormData = z.infer<typeof HabitSchema>;

// Todo validation schema
export const TodoSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional(),
  status: z.enum(["pending", "done"]).default("pending"),
});

export type TodoFormData = z.infer<typeof TodoSchema>;

// Note validation schema
export const NoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  content: z.string(),
  tags: z.array(z.string()).optional(),
  isPinned: z.boolean().default(false),
});

export type NoteFormData = z.infer<typeof NoteSchema>;

// Login validation schema
export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type LoginFormData = z.infer<typeof LoginSchema>;

// OTP verification schema
export const OTPSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits").regex(/^\d+$/, "Code must be numeric"),
});

export type OTPFormData = z.infer<typeof OTPSchema>;
