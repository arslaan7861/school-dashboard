import { UserRole } from "@/types/user";
import { z } from "zod";

export const createAdminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),

  email: z.string().email("Please enter admin email"), // Fixed z.email() to z.string().email()

  phone: z
    .string()
    .regex(/^\d+$/, "Phone must contain only digits")
    .min(10, "Phone must be at least 10 digits")
    .max(15, "Phone must be maximum 15 digits"),

  password: z.string().min(6, "Password must be at least 6 characters"),

  role: z.enum(UserRole, {
    // Fixed enum typing
    message: "Invalid role",
  }),
});

export const updateAdminSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),

    email: z.string().email("Please provide a valid email").optional(), // Fixed z.email()

    phone: z
      .string()
      .regex(/^\d+$/, "Phone must contain only digits")
      .min(10, "Phone must be at least 10 digits")
      .max(15, "Phone must be maximum 15 digits")
      .optional(),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .optional(),

    role: z
      .enum(UserRole, {
        // Fixed enum typing
        message: "Invalid role",
      })
      .optional(),
  })
  .strict();

export type createAdminSchemaType = z.infer<typeof createAdminSchema>;
export type updateAdminSchemaType = z.infer<typeof updateAdminSchema>;
