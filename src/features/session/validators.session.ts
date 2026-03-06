import { z } from "zod";

/* ---------------- CREATE SESSION ---------------- */

export const createSessionSchema = z
  .object({
    name: z
      .string({ message: "Please provide session name" })
      .min(4, "Please provide session name"),

    startDate: z // Changed from start_date
      .string({ message: "Please provide session start date" })
      .min(1, "Please provide session start date")
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Please provide a valid start date",
      }),

    endDate: z // Changed from end_date
      .string({ message: "Please provide session end date" })
      .min(1, "Please provide session end date")
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Please provide a valid end date",
      }),

    isActive: z.boolean().optional(), // Changed from is_active
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    // Changed
    message: "End date must be greater than start date",
    path: ["endDate"], // Changed
  });

/* ---------------- UPDATE SESSION ---------------- */

export const updateSessionSchema = z
  .object({
    name: z.string().min(4, "Please provide session name").optional(),

    startDate: z // Changed from start_date
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Please provide a valid start date",
      })
      .optional(),

    endDate: z // Changed from end_date
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Please provide a valid end date",
      })
      .optional(),

    isActive: z.boolean().optional(), // Added missing field
  })
  .strict()
  .refine((body) => Object.keys(body).length > 0, {
    message: "Please provide at least one field to update",
  });

/* ---------------- TYPES ---------------- */

export type CreateSessionSchemaType = z.infer<typeof createSessionSchema>;

export type UpdateSessionSchemaType = z.infer<typeof updateSessionSchema>;
