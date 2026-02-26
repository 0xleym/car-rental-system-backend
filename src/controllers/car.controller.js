import Car from "../models/car.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * GET /api/cars
 * List all cars. Supports optional query params: ?available=true&brand=Toyota
 */
export const getAllCars = asyncHandler(async (req, res) => {
  const filters = {};

  if (req.query.available !== undefined) {
    filters.available = req.query.available === "true";
  }
  if (req.query.brand) {
    filters.brand = req.query.brand;
  }

  const cars = await Car.findAll(filters);
  res.json(new ApiResponse(200, { cars }, "Cars retrieved successfully"));
});

/**
 * GET /api/cars/:id
 * Get a single car by ID.
 */
export const getCarById = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id);
  if (!car) {
    throw new ApiError(404, "Car not found");
  }

  res.json(new ApiResponse(200, { car }, "Car retrieved successfully"));
});

/**
 * POST /api/cars
 * Create a new car (admin only).
 */
export const createCar = asyncHandler(async (req, res) => {
  const car = await Car.create(req.body);
  res
    .status(201)
    .json(new ApiResponse(201, { car }, "Car created successfully"));
});

/**
 * PATCH /api/cars/:id
 * Update a car (admin only).
 */
export const updateCar = asyncHandler(async (req, res) => {
  const existing = await Car.findById(req.params.id);
  if (!existing) {
    throw new ApiError(404, "Car not found");
  }

  const car = await Car.update(req.params.id, req.body);
  res.json(new ApiResponse(200, { car }, "Car updated successfully"));
});

/**
 * DELETE /api/cars/:id
 * Delete a car (admin only).
 */
export const deleteCar = asyncHandler(async (req, res) => {
  const existing = await Car.findById(req.params.id);
  if (!existing) {
    throw new ApiError(404, "Car not found");
  }

  await Car.delete(req.params.id);
  res.json(new ApiResponse(200, null, "Car deleted successfully"));
});
