import { z } from "zod";

// ==================== ROUTE VALIDATORS ====================

export const createRouteSchema = z.object({
  name: z
    .string({ message: "Route name is required" })
    .min(2, "Route name must be at least 2 characters")
    .max(100, "Route name must be less than 100 characters"),
  sessionId: z
    .number({ message: "Session ID is required" })
    .int()
    .positive("Session ID must be a positive integer"),
  vehicleNumber: z.string().max(50).optional(),
  driverName: z.string().max(100).optional(),
  driverPhone: z
    .string()
    .regex(/^\d+$/, "Phone must contain only digits")
    .min(10, "Phone must be at least 10 digits")
    .max(15, "Phone must be maximum 15 digits")
    .optional(),
});

export type CreateRouteSchemaType = z.infer<typeof createRouteSchema>;

export const updateRouteSchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    vehicleNumber: z.string().max(50).nullable().optional(),
    driverName: z.string().max(100).nullable().optional(),
    driverPhone: z
      .string()
      .regex(/^\d+$/, "Phone must contain only digits")
      .min(10)
      .max(15)
      .nullable()
      .optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).length > 0, {
    message: "Please provide at least one field to update",
  });

export type UpdateRouteSchemaType = z.infer<typeof updateRouteSchema>;

// ==================== STOP VALIDATORS ====================

export const createStopSchema = z.object({
  routeId: z.number().int().positive("Route ID must be a positive integer"),
  name: z
    .string()
    .min(2, "Stop name must be at least 2 characters")
    .max(100, "Stop name must be less than 100 characters"),
  monthlyFee: z.number().positive("Monthly fee must be positive"),
  stopOrder: z
    .number()
    .int()
    .min(0, "Stop order must be a non-negative integer"),
  distanceKm: z.number().positive().optional(),
});

export type CreateStopSchemaType = z.infer<typeof createStopSchema>;

export const bulkCreateStopsSchema = z.object({
  routeId: z.number().int().positive("Route ID must be a positive integer"),
  stops: z
    .array(
      z.object({
        name: z.string().min(2).max(100),
        monthlyFee: z.number().positive(),
        stopOrder: z.number().int().min(0),
        distanceKm: z.number().positive().optional(),
      }),
    )
    .min(1, "At least one stop is required"),
});

export type BulkCreateStopsSchemaType = z.infer<typeof bulkCreateStopsSchema>;

export const updateStopSchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    monthlyFee: z.number().positive().optional(),
    stopOrder: z.number().int().min(0).optional(),
    distanceKm: z.number().positive().nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).length > 0, {
    message: "Please provide at least one field to update",
  });

export type UpdateStopSchemaType = z.infer<typeof updateStopSchema>;

// ==================== STUDENT TRANSPORT VALIDATORS ====================

export const assignStudentTransportSchema = z
  .object({
    classStudentId: z
      .number()
      .int()
      .positive("Class student ID must be a positive integer"),
    routeId: z.number().int().positive("Route ID must be a positive integer"),
    stopId: z.number().int().positive("Stop ID must be a positive integer"),
    customMonthlyFee: z.number().positive().optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format")
      .optional(),
    pickupTime: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format")
      .optional(),
    dropoffTime: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format")
      .optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.endDate) return true;
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: "End date must be greater than or equal to start date",
      path: ["endDate"],
    },
  );

export type AssignStudentTransportSchemaType = z.infer<
  typeof assignStudentTransportSchema
>;

export const updateStudentTransportSchema = z
  .object({
    routeId: z.number().int().positive().optional(),
    stopId: z.number().int().positive().optional(),
    customMonthlyFee: z.number().positive().nullable().optional(),
    pickupTime: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format")
      .nullable()
      .optional(),
    dropoffTime: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format")
      .nullable()
      .optional(),
    notes: z.string().optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).length > 0, {
    message: "Please provide at least one field to update",
  });

export type UpdateStudentTransportSchemaType = z.infer<
  typeof updateStudentTransportSchema
>;

export const terminateStudentTransportSchema = z.object({
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format"),
  reason: z.string().optional(),
});

export type TerminateStudentTransportSchemaType = z.infer<
  typeof terminateStudentTransportSchema
>;

// ==================== DISABLED MONTH VALIDATORS ====================

export const addDisabledMonthSchema = z.object({
  routeId: z.number().int().positive().nullable().optional(),
  sessionId: z.number().int().positive("Session ID must be a positive integer"),
  monthYear: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Month year must be in YYYY-MM format"),
  reason: z.string().max(255).optional(),
});

export type AddDisabledMonthSchemaType = z.infer<typeof addDisabledMonthSchema>;

// ==================== QUERY PARAMS VALIDATORS ====================

export const routesQuerySchema = z.object({
  sessionId: z.coerce.number().int().positive().optional(),
  isActive: z.enum(["true", "false"]).optional(),
});

export const stopsQuerySchema = z.object({
  isActive: z.enum(["true", "false"]).optional(),
});

export const studentTransportQuerySchema = z.object({
  isActive: z.enum(["true", "false"]).optional(),
});

export const disabledMonthsQuerySchema = z.object({
  sessionId: z.coerce.number().int().positive().optional(),
  routeId: z.coerce.number().int().positive().optional(),
});
