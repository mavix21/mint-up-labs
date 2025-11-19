import { z } from "zod";

import type { Id } from "@mint-up/convex/_generated/dataModel";

export const validCurrencies = ["USDC"] as const;

// Base schemas for discriminated unions
const onlineLocationSchema = z.object({
  type: z.literal("online"),
  url: z.string(), //z.url('Please enter a valid URL').min(1, 'URL is required'),
});

const inPersonLocationSchema = z.object({
  type: z.literal("in-person"),
  address: z.string(),
  instructions: z.string().optional(),
});

// Discriminated union for EventLocation
export const eventLocationSchema = z.discriminatedUnion("type", [
  onlineLocationSchema,
  inPersonLocationSchema,
]);

const organizationIdSchema = z.custom<Id<"organizations"> | null>((value) => {
  if (value === null) return true;
  return typeof value === "string";
});

// Base schemas for ticket types
const freeTicketSchema = z.object({
  type: z.literal("free"),
});

const paidTicketSchema = z.object({
  type: z.literal("paid"),
  price: z
    .number()
    .positive("Price must be positive")
    .min(0.001, "Price must be at least 0.001"),
  currency: z.enum(validCurrencies),
});

// Complete ticket schema with base fields
export const ticketTypeSchema = z.discriminatedUnion("type", [
  freeTicketSchema.extend({
    id: z.string(),
    name: z
      .string()
      .min(1, "Ticket name is required")
      .max(100, "Ticket name too long"),
    description: z.string().max(100, "Description too long"),
    supply: z.number().positive("Supply must be positive").optional(),
  }),
  paidTicketSchema.extend({
    id: z.string(),
    name: z
      .string()
      .min(1, "Ticket name is required")
      .max(100, "Ticket name too long"),
    description: z.string().max(100, "Description too long"),
    supply: z.number().positive("Supply must be positive").optional(),
  }),
]);

// Date and time validation helpers
const dateStringSchema = z.string().refine(
  (date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  },
  { message: "Date must be valid" },
);

const timeStringSchema = z
  .string()
  .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format");

// Category validation
export const validCategories = [
  "music & performing arts",
  "business & professional",
  "arts & culture",
  "tech",
  "gaming",
  "food & drink",
  "health & wellness",
  "sports & fitness",
  "education & learning",
  "community & causes",
  "parties & socials",
  "hobbies & interests",
  "",
] as const;

export const eventCategorySchema = z
  .enum(validCategories)
  .superRefine((val, ctx) => {
    if (!val || val.trim() === "") {
      ctx.addIssue({
        code: "custom",
        message: "Please select a category",
      });
    }
  });

// Main create event form schema
export const createEventFormSchema = z
  .object({
    name: z
      .string()
      .min(1, "Event name is required")
      .max(200, "Event name too long")
      .transform((val) => val.trim()),

    theme: z.union([z.undefined(), z.string()]),
    category: eventCategorySchema,

    image: z.instanceof(File),

    startDate: dateStringSchema,
    startTime: timeStringSchema,
    endDate: dateStringSchema,
    endTime: timeStringSchema,

    location: eventLocationSchema,

    description: z
      .string()
      .max(2000, "Description too long")
      .transform((val) => val.trim()),

    tickets: z
      .array(ticketTypeSchema)
      .min(1, "At least one ticket type is required")
      .max(10, "Maximum 10 ticket types allowed"),

    ownershipType: z.enum(["individual", "community"]),
    organizationId: organizationIdSchema,
  })
  .refine(
    (data) => {
      const startDateTime = new Date(`${data.startDate}T${data.startTime}`);
      const endDateTime = new Date(`${data.endDate}T${data.endTime}`);
      return endDateTime > startDateTime;
    },
    {
      message: "End date/time must be after start date/time",
      path: ["endTime"], // This will show the error on the endTime field
    },
  );
// .refine(
//   (data) => {
//     const startDateTime = new Date(`${data.startDate}T${data.startTime}`);
//     const now = new Date();
//     // Compare full datetime values, not just dates
//     return startDateTime > now;
//   },
//   {
//     message: 'Event must start in the future',
//     path: ['startDate'],
//   }
// );

// Schema for generating new ticket IDs
export const generateTicketId = () => crypto.randomUUID();

// Helper schema for creating a new ticket (without ID)
export const createTicketSchema = z
  .object({
    type: z.enum(["free", "paid"]),
    price: z
      .number()
      .positive("Price must be positive")
      .min(0.01, "Price must be at least 0.01")
      .optional(),
    currency: z.enum(validCurrencies).optional(),
    name: z
      .string()
      .min(1, "Ticket name is required")
      .max(100, "Ticket name too long"),
    description: z
      .string()
      .min(1, "Ticket description is required")
      .max(500, "Description too long"),
    supply: z.number().positive("Supply must be positive").optional(),
  })
  .transform((data) => ({
    ...data,
    id: generateTicketId(),
  }));

// Schema for updating an existing ticket
export const updateTicketSchema = ticketTypeSchema;

// Schema for form submission (with additional validation)
export const submitEventSchema = createEventFormSchema
  .extend({
    // Add any additional fields needed for submission
    timezone: z.string().optional(),
    theme: z.string().optional(),
  })
  .transform((data) => ({
    ...data,
    // Ensure dates are properly formatted
    startDateTime: new Date(
      `${data.startDate}T${data.startTime}`,
    ).toISOString(),
    endDateTime: new Date(`${data.endDate}T${data.endTime}`).toISOString(),
    // Remove individual date/time fields as they're now combined
    startDate: undefined,
    startTime: undefined,
    endDate: undefined,
    endTime: undefined,
  }));

// Type exports for TypeScript
export type Cryptocurrency = (typeof validCurrencies)[number];
export type CreateEventFormData = z.infer<typeof createEventFormSchema>;
export type EventLocation = z.infer<typeof eventLocationSchema>;
export type TicketType = z.infer<typeof ticketTypeSchema>;
export type SubmitEventData = z.infer<typeof submitEventSchema>;
export type EventCategory = z.infer<typeof eventCategorySchema>;

// Validation error type
export type CreateEventFormErrors = z.ZodFormattedError<CreateEventFormData>;

// Helper function to validate form data
export const validateCreateEventForm = (data: unknown): CreateEventFormData => {
  return createEventFormSchema.parse(data);
};

// Helper function to safely validate form data (returns errors instead of throwing)
export const safeValidateCreateEventForm = (
  data: unknown,
):
  | { success: true; data: CreateEventFormData }
  | { success: false; errors: CreateEventFormErrors } => {
  const result = createEventFormSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error.format() };
};
