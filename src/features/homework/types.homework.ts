import { z } from "zod";

// Zod Schema for Homework Creation
export const createHomeworkSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must be in YYYY-MM-DD format"),
  subjectId: z.number().int().positive("Please select a subject"),
});

// Zod Schema for Homework Update (all fields optional)
export const updateHomeworkSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").optional(),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .optional(),
    dueDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must be in YYYY-MM-DD format")
      .optional(),
    subjectId: z.number().int().positive("Please select a subject").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type CreateHomeworkType = z.infer<typeof createHomeworkSchema>;
export type UpdateHomeworkType = z.infer<typeof updateHomeworkSchema>;

export interface HomeworkAttachment {
  id: number;
  url: string;
  fileName: string;
  fileType: string;
}

export interface ClassTeacher {
  id: number;
  name: string;
}

export interface Homework {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  createdAt: string;
  class: {
    id: number;
    name: string;
    section: string;
    classTeacher: ClassTeacher | null;
  };
  subject: {
    id: number;
    name: string;
    teacher: {
      id: number;
      name: string;
    };
  };
  assignedBy: {
    id: number;
    name: string;
    role: string;
    profilePic?: string | null;
  };
  attachments: HomeworkAttachment[];
}

export interface HomeworkListResponse {
  success: boolean;
  message: string;
  data: Homework[];
}

export interface HomeworkResponse {
  success: boolean;
  message: string;
  data: Homework;
}
