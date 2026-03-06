import { z } from "zod";

export const weekDayEnum = z.enum([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
]);

export type WeekDay = z.infer<typeof weekDayEnum>;

// Time validation regex (HH:MM format)
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const slotTimingSchema = z.object({
  startTime: z
    .string()
    .regex(timeRegex, "Invalid time format. Use HH:MM")
    .optional(),
  endTime: z
    .string()
    .regex(timeRegex, "Invalid time format. Use HH:MM")
    .optional(),
});

export const entryFormSchema = z.object({
  subjectId: z.number().int().positive("Subject is required"),
  subjectComponentId: z.number().int().positive("Component is required"),
  academicBatchId: z.number().int().positive("Batch is required"),
  teacherId: z.number().int().positive("Teacher is required"),
});

export type SlotTimingFormData = z.infer<typeof slotTimingSchema>;
export type EntryFormData = z.infer<typeof entryFormSchema>;

export const createTimetableSlotSchema = z.object({
  classId: z.number().int().positive(),
  day: weekDayEnum,
  lectureNo: z.number().int().positive().max(10),
  startTime: z
    .string()
    .regex(timeRegex, "Invalid time format. Use HH:MM")
    .optional(),
  endTime: z
    .string()
    .regex(timeRegex, "Invalid time format. Use HH:MM")
    .optional(),
});

export const updateTimetableSlotSchema = z.object({
  startTime: z
    .string()
    .regex(timeRegex, "Invalid time format. Use HH:MM")
    .optional(),
  endTime: z
    .string()
    .regex(timeRegex, "Invalid time format. Use HH:MM")
    .optional(),
});

export const createTimetableEntrySchema = z.object({
  timetableSlotId: z.number().int().positive(),
  classId: z.number().int().positive(),
  subjectId: z.number().int().positive(),
  subjectComponentId: z.number().int().positive(),
  academicBatchId: z.number().int().positive(),
  teacherId: z.number().int().positive(),
});

export const updateTimetableEntrySchema = z.object({
  subjectId: z.number().int().positive().optional(),
  subjectComponentId: z.number().int().positive().optional(),
  academicBatchId: z.number().int().positive().optional(),
  teacherId: z.number().int().positive().optional(),
});
