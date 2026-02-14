import { z } from "zod";

/* ---------------- CREATE SESSION ---------------- */

export const createSessionSchema = z
  .object({
    name: z
      .string({ message: "Please provide session name" })
      .min(4, "Please provide session name"),

    start_date: z
      .string({ message: "Please provide session start date" })
      .min(1, "Please provide session start date")
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Please provide a valid start date",
      }),

    end_date: z
      .string({ message: "Please provide session end date" })
      .min(1, "Please provide session end date")
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Please provide a valid end date",
      }),

    is_active: z.boolean().optional(),
  })
  .refine((data) => new Date(data.end_date) > new Date(data.start_date), {
    message: "End date must be greater than start date",
    path: ["end_date"],
  });

/* ---------------- UPDATE SESSION ---------------- */

export const updateSessionSchema = z
  .object({
    name: z.string().min(4, "Please provide session name").optional(),

    start_date: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Please provide a valid start date",
      })
      .optional(),

    end_date: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Please provide a valid end date",
      })
      .optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).length > 0, {
    message: "Please provide at least one field to update",
  });

/* ---------------- TYPES ---------------- */

export type CreateSessionSchemaType = z.infer<typeof createSessionSchema>;

export type UpdateSessionSchemaType = z.infer<typeof updateSessionSchema>;
