import { z } from "zod/v4";

export const createCarSchema = z.object({
  name: z
    .string()
    .min(1, "Car name is required")
    .max(255, "Car name must be at most 255 characters"),
  brand: z
    .string()
    .min(1, "Brand is required")
    .max(255, "Brand must be at most 255 characters"),
  model_year: z
    .number()
    .int()
    .min(1900, "Model year must be at least 1900")
    .max(new Date().getFullYear() + 1, "Model year cannot be in the future"),
  rent_per_day: z
    .number()
    .positive("Rent per day must be a positive number")
    .max(99999999.99, "Rent per day is too large"),
});

export const updateCarSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  brand: z.string().min(1).max(255).optional(),
  model_year: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1)
    .optional(),
  rent_per_day: z.number().positive().max(99999999.99).optional(),
  available: z.boolean().optional(),
});
