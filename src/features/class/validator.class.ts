import { z } from "zod";

export const createClassSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  section: z.string().min(1, "Section is required"),
  session_id: z.number().int().positive(),
  class_teacher_id: z.number().int().positive(),

  subjects: z
    .array(
      z.object({
        name: z.string().min(1, "Subject name required"),
        teacher_id: z.number().int().positive(),
      }),
    )
    .min(1, "At least one subject required")
    .refine(
      (subjects) => {
        const names = subjects.map((s) => s.name.toLowerCase().trim());
        return new Set(names).size === names.length;
      },
      {
        message: "Duplicate subject names are not allowed",
        path: ["subjects"],
      },
    ),
});

export const updateClassSchema = z
  .object({
    name: z.string().min(1).optional(),
    section: z.string().min(1).optional(),
    session_id: z.number().int().positive().optional(),
    class_teacher_id: z.number().int().positive().optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).length > 0, {
    message: "Provide at least one field to update",
  });
export type createClassSchemaType = z.infer<typeof createClassSchema>;
export type updateClassSchemaType = z.infer<typeof updateClassSchema>;
