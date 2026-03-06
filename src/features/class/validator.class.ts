import { z } from "zod";

export const createClassSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  section: z.string().min(1, "Section is required"),
  sessionId: z.number().int().positive(),
  classTeacherId: z.string().min(1, "Class teacher is required"), // Changed to string
});

export const updateClassSchema = z
  .object({
    name: z.string().min(1).optional(),
    section: z.string().min(1).optional(),
    sessionId: z.number().int().positive().optional(),
    classTeacherId: z.string().min(1).optional(), // Changed to string
  })
  .strict()
  .refine((body) => Object.keys(body).length > 0, {
    message: "Provide at least one field to update",
  });

export type createClassSchemaType = z.infer<typeof createClassSchema>;
export type updateClassSchemaType = z.infer<typeof updateClassSchema>;
