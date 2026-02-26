import { z } from "zod/v4";

export const createBookingSchema = z.object({
  car_id: z.number().int().positive("Car ID must be a positive integer"),
  days: z
    .number()
    .int()
    .positive("Days must be a positive integer")
    .max(365, "Booking cannot exceed 365 days"),
});

export const updateBookingSchema = z.object({
  status: z.enum(["booked", "completed", "cancelled"]),
});
