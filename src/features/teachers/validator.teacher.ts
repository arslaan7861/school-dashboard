import { z } from "zod";

export const createTeacherSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),

  email: z.string().email("Please enter teacher email"),
  phone: z
    .string()
    .regex(/^\d+$/, "Phone must contain only digits")
    .min(10, "Phone must be at least 10 digits")
    .max(15, "Phone must be maximum 15 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),

  employeeCode: z.string().min(2, "Please provide employee code"), // Changed
  joiningDate: z // Changed
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

    isActive: z.boolean().optional(), // Changed

    // ✅ Teacher fields (optional update)
    employeeCode: z.string().min(2, "Please provide employee code").optional(), // Changed

    joiningDate: z // Changed
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
