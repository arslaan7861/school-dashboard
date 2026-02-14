import { UserRole } from "@/types/user";
import { z } from "zod";

export const createAdminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),

  email: z.email("Please enter admin email"),

  phone: z
    .string("Please enter admin phone number")
    .regex(/^\d+$/, "Phone must contain only digits")
    .min(10, "Phone must be at least 10 digits")
    .max(15, "Phone must be maximum 15 digits"),

  password: z.string().min(6, "Password must be at least 6 characters"),

  role: z.enum(UserRole, {
    message: "Invalid role",
  }),
});

export const updateAdminSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),

    email: z.email("Please provide a valid email").optional(),

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
        message: "Invalid role",
      })
      .optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).length > 0, {
    message: "Please provide at least one field to update",
  });

export type createAdminSchemaType = z.infer<typeof createAdminSchema>;
export type updateAdminSchemaType = z.infer<typeof updateAdminSchema>;
