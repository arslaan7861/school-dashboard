import { z } from "zod";

// ==================== Base Schemas ====================

export const homeworkBaseSchema = {
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters"),
  dueDate: z.string(),
  subjectId: z.number().int().positive("Subject is required"),
};

export const attachmentSchema = z.array(z.any()).optional();

// ==================== Create Homework Schema ====================

export const createHomeworkSchema = z.object({
  title: homeworkBaseSchema.title,
  description: homeworkBaseSchema.description,
  dueDate: homeworkBaseSchema.dueDate,
  subjectId: homeworkBaseSchema.subjectId,
  files: z.array(z.any()).optional(),
});

export type CreateHomeworkFormData = z.infer<typeof createHomeworkSchema>;

// ==================== Bulk Assignment Item Schema ====================

export const bulkHomeworkItemSchema = z.object({
  title: homeworkBaseSchema.title,
  description: homeworkBaseSchema.description,
  dueDate: homeworkBaseSchema.dueDate,
  subjectId: homeworkBaseSchema.subjectId,
  files: z.array(z.any()).optional(),
});

export const bulkCreateHomeworkSchema = z.object({
  assignments: z
    .array(bulkHomeworkItemSchema)
    .min(1, "At least one assignment is required"),
});

export type BulkHomeworkItemFormData = z.infer<typeof bulkHomeworkItemSchema>;
export type BulkCreateHomeworkFormData = z.infer<
  typeof bulkCreateHomeworkSchema
>;

// ==================== Update Homework Schema ====================

export const updateHomeworkSchema = z
  .object({
    title: homeworkBaseSchema.title.optional(),
    description: homeworkBaseSchema.description.optional(),
    dueDate: homeworkBaseSchema.dueDate.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be updated",
  });

export type UpdateHomeworkFormData = z.infer<typeof updateHomeworkSchema>;

// ==================== API Error Response Type ====================

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  message: string;
  errors?: ApiFieldError[];
}
