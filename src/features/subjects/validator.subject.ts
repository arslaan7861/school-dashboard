import { z } from "zod";

// Enums matching the backend
export const MarksTypeEnum = z.enum(["number", "grade", "none"]);
export const ComponentTypeEnum = z.enum([
  "theory",
  "practical",
  "internal",
  "project",
  "viva",
  "other",
]);

// Reusable schemas
export const teacherIdSchema = z.number().int().positive();

// Batch schema for updates
export const batchUpdateSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1, "Batch name is required"),
  capacity: z.number().int().positive().optional(),
  teacherId: teacherIdSchema,
  _delete: z.boolean().optional(),
});

// Component schema for updates
export const componentUpdateSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1, "Component name is required"),
  type: ComponentTypeEnum,
  displayOrder: z.number().int().min(0),
  includeInResult: z.boolean(),
  batches: z.array(batchUpdateSchema).min(1, "At least one batch is required"),
  _delete: z.boolean().optional(),
});

// Full subject update schema
export const updateSubjectFullSchema = z.object({
  name: z.string().min(1, "Subject name is required").optional(),
  marksType: MarksTypeEnum.optional(),
  isOptional: z.boolean().optional(),
  isElective: z.boolean().optional(),
  components: z.array(componentUpdateSchema).optional(),
});

export type UpdateSubjectFullData = z.infer<typeof updateSubjectFullSchema>;

// Create subject schema (for creation page)
export const createSubjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  marksType: MarksTypeEnum.default("number"),
  isOptional: z.boolean().default(false),
  isElective: z.boolean().default(false),
  components: z
    .array(
      z.object({
        name: z.string().min(1, "Component name is required"),
        type: ComponentTypeEnum.default("other"),
        displayOrder: z.number().int().min(0).default(0),
        includeInResult: z.boolean().default(true),
        batches: z
          .array(
            z.object({
              name: z.string().min(1, "Batch name is required"),
              capacity: z.number().int().positive().optional(),
              teacherId: teacherIdSchema,
            }),
          )
          .min(1, "At least one batch is required"),
      }),
    )
    .min(1, "At least one component is required"),
});

export const createMultipleSubjectsSchema = z.object({
  subjects: z
    .array(createSubjectSchema)
    .min(1, "At least one subject is required"),
});

export type CreateMultipleSubjectsPayload = z.infer<
  typeof createMultipleSubjectsSchema
>;
