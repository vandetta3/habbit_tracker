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

// Timer validation schemas
export const TimerStepSchema = z.object({
  label: z.string().min(1, "Label is required").max(80, "Label must be less than 80 characters"),
  durationMs: z.number().min(1000, "Duration must be at least 1 second").max(86400000, "Duration must be less than 24 hours"),
  type: z.literal("countdown"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").optional(),
  groupId: z.string().optional(),
});

export const TimerGroupSchema = z.object({
  name: z.string().max(50, "Group name must be less than 50 characters").optional(),
  repeatCount: z.number().min(1, "Repeat count must be at least 1").max(99, "Repeat count must be less than 99"),
  stepIds: z.array(z.string()).min(1, "Group must have at least 1 step"),
});

export const TimerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80, "Name must be less than 80 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  tags: z.array(z.string().max(30, "Tag must be less than 30 characters")).max(10, "Maximum 10 tags allowed").optional(),
  repeatEntireRoutine: z.number().min(1, "Repeat count must be at least 1").max(99, "Repeat count must be less than 99").default(1),
  steps: z.array(TimerStepSchema).min(1, "Timer must have at least 1 step"),
  groups: z.array(TimerGroupSchema).optional(),
});

export const SoundSettingsSchema = z.object({
  soundProfile: z.enum(["OFF", "BEEP", "BEEP+VOICE"]),
  warningCountdown: z.number().min(0, "Warning countdown must be 0 or greater").max(30, "Warning countdown must be 30 seconds or less"),
  startSound: z.boolean(),
  endSound: z.boolean(),
  stepChangeSound: z.boolean(),
  volume: z.number().min(0, "Volume must be at least 0").max(100, "Volume must be at most 100"),
  voiceText: z.string().max(120, "Voice text must be less than 120 characters").optional(),
});

export type TimerStepFormData = z.infer<typeof TimerStepSchema>;
export type TimerGroupFormData = z.infer<typeof TimerGroupSchema>;
export type TimerFormData = z.infer<typeof TimerSchema>;
export type SoundSettingsFormData = z.infer<typeof SoundSettingsSchema>;
