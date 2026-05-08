import { z } from "zod";
import { CalendarAction } from "./types.calendar";

// Date validation regex
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// Base update schema
export const updateCalendarSchema = z
  .object({
    action: z.enum([
      CalendarAction.MARK_HOLIDAY,
      CalendarAction.REMOVE_HOLIDAY,
      CalendarAction.CREATE_EVENT,
      CalendarAction.REMOVE_EVENT,
      CalendarAction.LOCK_ATTENDANCE,
      CalendarAction.UNLOCK_ATTENDANCE,
    ]),

    sessionId: z.number().int().positive("Session ID is required"),

    startDate: z
      .string()
      .regex(dateRegex, "Start date must be in YYYY-MM-DD format"),
    endDate: z
      .string()
      .regex(dateRegex, "End date must be in YYYY-MM-DD format"),

    classIds: z.array(z.number().int().positive()).optional(),

    holidayTitle: z.string().optional(),
    holidayDescription: z.string().optional(),

    event: z.string().optional(),
    eventDescription: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Validate that endDate is not before startDate
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (end < start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date cannot be before start date",
        path: ["endDate"],
      });
    }

    // Validate required fields based on action
    if (data.action === CalendarAction.MARK_HOLIDAY && !data.holidayTitle) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Holiday title is required when marking holiday",
        path: ["holidayTitle"],
      });
    }

    if (data.action === CalendarAction.CREATE_EVENT && !data.event) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Event is required when creating event",
        path: ["event"],
      });
    }
  });

// Holiday form schema
export const holidayFormSchema = z
  .object({
    startDate: z.date("Start date is required"),
    endDate: z.date("End date is required"),
    classIds: z.array(z.number()).optional(),
    holidayTitle: z
      .string()
      .min(2, "Holiday title must be at least 2 characters"),
    holidayDescription: z.string().optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date cannot be before start date",
    path: ["endDate"],
  });

export type HolidayFormValues = z.infer<typeof holidayFormSchema>;

// Event form schema
export const eventFormSchema = z
  .object({
    startDate: z.date("Start date is required"),
    endDate: z.date("End date is required"),
    classIds: z.array(z.number()).optional(),
    event: z.string().min(2, "Event name must be at least 2 characters"),
    eventDescription: z.string().optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date cannot be before start date",
    path: ["endDate"],
  });

export type EventFormValues = z.infer<typeof eventFormSchema>;

// Attendance lock form schema
export const attendanceLockFormSchema = z
  .object({
    startDate: z.date("Start date is required"),
    endDate: z.date("End date is required"),
    classIds: z.array(z.number()).optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date cannot be before start date",
    path: ["endDate"],
  });

export type AttendanceLockFormValues = z.infer<typeof attendanceLockFormSchema>;
