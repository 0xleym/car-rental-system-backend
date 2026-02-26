import { Router } from "express";
import {
  createBooking,
  getBookings,
  getBookingSummary,
  getBookingById,
  updateBooking,
} from "../controllers/booking.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.js";
import {
  createBookingSchema,
  updateBookingSchema,
} from "../validators/booking.validator.js";

const router = Router();

// All booking routes require authentication
router.use(authMiddleware);

router.post("/", validate(createBookingSchema), createBooking);
router.get("/", getBookings);
router.get("/summary", getBookingSummary);
router.get("/:id", getBookingById);
router.patch("/:id", validate(updateBookingSchema), updateBooking);

export default router;
