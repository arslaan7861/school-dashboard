import { z } from "zod";
import { ExamType } from "./types.exam";

export const createExamSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  type: z.nativeEnum(ExamType),
  startDate: z.string().min(10, "Start date is required"),
  endDate: z.string().min(10, "End date is required"),
  includeInFinalResult: z.boolean().default(true),
  weightage: z.coerce.number().min(0).max(100).optional(),
});

export const updateExamSchema = createExamSchema.partial();

export type CreateExamSchemaType = z.infer<typeof createExamSchema>;
export type UpdateExamSchemaType = z.infer<typeof updateExamSchema>;
