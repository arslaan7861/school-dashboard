import { z } from "zod";

// Phone number validation regex
const phoneRegex = /^\d+$/;

// Create student form schema
export const createStudentFormSchema = z.object({
  admissionNo: z
    .string()
    .min(2, "Admission number must be at least 2 characters"),
  name: z.string().min(2, "Student name must be at least 2 characters"),
  gender: z.enum(["male", "female", "other"]).optional(),
  dob: z.string().optional(),
  sessionId: z.number().int().positive("Session ID is required"),
  classId: z.number().int().positive("Class ID is required"),
  rollNumber: z
    .number()
    .int()
    .positive("Roll number must be a positive number"),
  fatherName: z.string().optional(),
  fatherPhone: z
    .string()
    .regex(phoneRegex, "Phone must contain only digits")
    .min(10, "Phone must be at least 10 digits")
    .max(15, "Phone must be maximum 15 digits")
    .optional(),
  motherName: z.string().optional(),
  motherPhone: z
    .string()
    .regex(phoneRegex, "Phone must contain only digits")
    .min(10, "Phone must be at least 10 digits")
    .max(15, "Phone must be maximum 15 digits")
    .optional(),
  guardianName: z.string().optional(),
  guardianPhone: z
    .string()
    .regex(phoneRegex, "Phone must contain only digits")
    .min(10, "Phone must be at least 10 digits")
    .max(15, "Phone must be maximum 15 digits")
    .optional(),
  email: z.string().email("Invalid email format"),
  phone: z
    .string()
    .regex(phoneRegex, "Phone must contain only digits")
    .min(10, "Phone must be at least 10 digits")
    .max(15, "Phone must be maximum 15 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type CreateStudentFormValues = z.infer<typeof createStudentFormSchema>;

// Update student form schema
export const updateStudentFormSchema = z
  .object({
    admissionNo: z
      .string()
      .min(2, "Admission number must be at least 2 characters")
      .optional(),
    name: z
      .string()
      .min(2, "Student name must be at least 2 characters")
      .optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    dob: z.string().optional(),
    fatherName: z.string().optional(),
    fatherPhone: z
      .string()
      .regex(phoneRegex, "Phone must contain only digits")
      .min(10, "Phone must be at least 10 digits")
      .max(15, "Phone must be maximum 15 digits")
      .optional(),
    motherName: z.string().optional(),
    motherPhone: z
      .string()
      .regex(phoneRegex, "Phone must contain only digits")
      .min(10, "Phone must be at least 10 digits")
      .max(15, "Phone must be maximum 15 digits")
      .optional(),
    guardianName: z.string().optional(),
    guardianPhone: z
      .string()
      .regex(phoneRegex, "Phone must contain only digits")
      .min(10, "Phone must be at least 10 digits")
      .max(15, "Phone must be maximum 15 digits")
      .optional(),
    email: z.string().email("Invalid email format").optional().nullable(),
    phone: z
      .string()
      .regex(phoneRegex, "Phone must contain only digits")
      .min(10, "Phone must be at least 10 digits")
      .max(15, "Phone must be maximum 15 digits")
      .optional()
      .nullable(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type UpdateStudentFormValues = z.infer<typeof updateStudentFormSchema>;
