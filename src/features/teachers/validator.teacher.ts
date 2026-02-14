import { z } from "zod";

export const createTeacherSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),

  email: z.email("Please enter teacher email"),
  phone: z
    .string("Please enter teacher phone number")
    .regex(/^\d+$/, "Phone must contain only digits")
    .min(10, "Phone must be at least 10 digits")
    .max(15, "Phone must be maximum 15 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  employee_code: z.string().min(2, "Please provide employee code"),
  joining_date: z
    .string()
    .min(1, "Please provide joining date")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Please provide a valid joining date",
    }),

  qualification: z.string().min(2, "Please provide qualification"),
});
export const updateTeacherSchema = z
  .object({
    // ✅ User fields (optional update)
    name: z.string().min(2, "Name must be at least 2 characters").optional(),

    email: z
      .string()
      .email("Please provide a valid email")
      .optional()
      .nullable(),
    phone: z
      .string()
      .regex(/^\d+$/, "Phone must contain only digits")
      .min(10, "Phone must be at least 10 digits")
      .max(15, "Phone must be maximum 15 digits")
      .optional()
      .nullable(),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .optional(),

    is_active: z.boolean().optional(),

    // ✅ Teacher fields (optional update)
    employee_code: z.string().min(2, "Please provide employee code").optional(),

    joining_date: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Please provide a valid joining date",
      })
      .optional(),

    qualification: z.string().min(2, "Please provide qualification").optional(),
  })
  .strict();

export type createTeacherSchemaType = z.infer<typeof createTeacherSchema>;
export type updateTeacherSchemaType = z.infer<typeof updateTeacherSchema>;
