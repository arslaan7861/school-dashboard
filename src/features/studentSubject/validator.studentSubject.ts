import { z } from "zod";

// Reusable schemas
export const classStudentIdSchema = z.number().int().positive();
export const subjectIdSchema = z.number().int().positive();
export const componentIdSchema = z.number().int().positive();
export const batchIdSchema = z.number().int().positive();
export const enrollmentIdSchema = z.number().int().positive();

// Component selection schema
export const componentSelectionSchema = z.object({
  componentId: componentIdSchema,
  batchId: batchIdSchema,
});

// Add optional subject schema
export const addOptionalSubjectSchema = z.object({
  classStudentId: classStudentIdSchema,
  subjectId: subjectIdSchema,
  componentBatches: z.array(componentSelectionSchema).optional().default([]),
});

export type AddOptionalSubjectBody = z.infer<typeof addOptionalSubjectSchema>;

// Change batch schema
export const changeBatchSchema = z.object({
  enrollmentId: enrollmentIdSchema,
  newBatchId: batchIdSchema,
});

export type ChangeBatchBody = z.infer<typeof changeBatchSchema>;

// Remove subject params
export const removeSubjectParamsSchema = z.object({
  classStudentId: z.number().int().positive(),
  subjectId: z.number().int().positive(),
});

export type RemoveSubjectParams = z.infer<typeof removeSubjectParamsSchema>;

// Get subjects by class query
export const getSubjectsByClassQuerySchema = z.object({
  sessionId: z.number().int().positive(),
  includeDetails: z.boolean().optional().default(false),
  isOptional: z.boolean().optional(),
  isElective: z.boolean().optional(),
  search: z.string().optional(),
});

export type GetSubjectsByClassQuery = z.infer<
  typeof getSubjectsByClassQuerySchema
>;
