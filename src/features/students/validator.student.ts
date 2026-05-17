// validator.student.ts

import { z } from "zod";

// Phone number validation regex
const phoneRegex = /^\d+$/;
const aadhaarRegex = /^\d{12}$/;
const optionalPhoneSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? undefined : value))
  .optional()
  .refine(
    (value) => {
      if (!value) return true;

      return phoneRegex.test(value) && value.length >= 10 && value.length <= 15;
    },
    {
      message: "Please enter a valid phone number",
    },
  );
// Create student form schema
export const createStudentFormSchema = z.object({
  admissionNo: z
    .string()
    .min(2, "Admission number must be at least 2 characters"),
  name: z.string().min(2, "Student name must be at least 2 characters"),
  aadhaarNumber: z
    .string()
    .length(12, "Aadhaar number must be exactly 12 digits")
    .regex(aadhaarRegex, "Aadhaar number must contain only digits"),
  address: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  dob: z.string().optional(),
  sessionId: z.number().int().positive("Session ID is required"),
  classId: z.number().int().positive("Class ID is required"),
  rollNumber: z
    .number()
    .int()
    .positive("Roll number must be a positive number"),
  fatherName: z.string().optional(),
  fatherPhone: optionalPhoneSchema,
  motherName: z.string().optional(),
  motherPhone: optionalPhoneSchema,
  guardianName: z.string().optional(),
  guardianPhone: optionalPhoneSchema,
  email: z.email("Please enter a valid email"),
  phone: z
    .string()
    .regex(phoneRegex, "Phone enter a valid phone number")
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
    aadhaarNumber: z
      .string()
      .length(12, "Aadhaar number must be exactly 12 digits")
      .regex(aadhaarRegex, "Aadhaar number must contain only digits")
      .optional(),
    address: z.string().optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    dob: z.string().optional(),
    fatherName: z.string().optional(),
    fatherPhone: optionalPhoneSchema,
    motherName: z.string().optional(),
    motherPhone: optionalPhoneSchema,
    guardianName: z.string().optional(),
    guardianPhone: optionalPhoneSchema,
    email: z.email("Please enter a valid email").optional(),
    phone: optionalPhoneSchema,
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type UpdateStudentFormValues = z.infer<typeof updateStudentFormSchema>;
