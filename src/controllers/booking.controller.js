import Booking from "../models/booking.model.js";
import Car from "../models/car.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { BOOKING_STATUS } from "../constants.js";

/**
 * POST /api/bookings
 * Create a new booking. Validates car exists and is available.
 * Marks the car as unavailable after booking.
 */
export const createBooking = asyncHandler(async (req, res) => {
  const { car_id, days } = req.body;
  const user_id = req.user.userId;

  // Verify car exists and is available
  const car = await Car.findById(car_id);
  if (!car) {
    throw new ApiError(404, "Car not found");
  }
  if (!car.available) {
    throw new ApiError(409, "Car is not available for booking");
  }

  // Create the booking
  const booking = await Booking.create({
    user_id,
    car_id,
    car_name: car.name,
    days,
    rent_per_day: car.rent_per_day,
    status: BOOKING_STATUS.BOOKED,
  });

  // Mark car as unavailable
  await Car.setAvailability(car_id, false);

  const totalCost = Booking.calculateTotalCost(
    days,
    parseFloat(car.rent_per_day)
  );

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { booking, total_cost: totalCost },
        "Booking created successfully"
      )
    );
});

/**
 * GET /api/bookings
 * List bookings. Users see their own, admins see all.
 */
export const getBookings = asyncHandler(async (req, res) => {
  let bookings;

  if (req.user.role === "admin") {
    bookings = await Booking.findAll();
  } else {
    bookings = await Booking.findByUserId(req.user.userId);
  }

  res.json(
    new ApiResponse(200, { bookings }, "Bookings retrieved successfully")
  );
});

/**
 * GET /api/bookings/summary
 * Get booking summary stats for the current user.
 */
export const getBookingSummary = asyncHandler(async (req, res) => {
  const summary = await Booking.getSummary(req.user.userId);
  res.json(new ApiResponse(200, { summary }, "Summary retrieved successfully"));
});

/**
 * GET /api/bookings/:id
 * Get a single booking by ID. Users can only access their own.
 */
export const getBookingById = asyncHandler(async (req, res) => {
  const bookingId = req.params.id;
  let booking;

  if (req.user.role === "admin") {
    booking = await Booking.findByBookingId(bookingId);
  } else {
    booking = await Booking.findByUserIdAndBookingId(
      req.user.userId,
      bookingId
    );
  }

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  res.json(new ApiResponse(200, { booking }, "Booking retrieved successfully"));
});

/**
 * PATCH /api/bookings/:id
 * Update a booking's status (cancel or complete).
 * When cancelled or completed, car becomes available again.
 */
export const updateBooking = asyncHandler(async (req, res) => {
  const bookingId = req.params.id;
  const { status } = req.body;

  // Find the booking (scoped to user, or any for admin)
  let booking;
  if (req.user.role === "admin") {
    booking = await Booking.findByBookingId(bookingId);
  } else {
    booking = await Booking.findByUserIdAndBookingId(
      req.user.userId,
      bookingId
    );
  }

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  // Validate status transitions
  if (booking.status === BOOKING_STATUS.CANCELLED) {
    throw new ApiError(400, "Cannot update a cancelled booking");
  }
  if (booking.status === BOOKING_STATUS.COMPLETED) {
    throw new ApiError(400, "Cannot update a completed booking");
  }

  const updated = await Booking.update(bookingId, { status });

  // If cancelled or completed, make the car available again
  if (
    status === BOOKING_STATUS.CANCELLED ||
    status === BOOKING_STATUS.COMPLETED
  ) {
    if (booking.car_id) {
      await Car.setAvailability(booking.car_id, true);
    }
  }

  res.json(
    new ApiResponse(200, { booking: updated }, "Booking updated successfully")
  );
});
