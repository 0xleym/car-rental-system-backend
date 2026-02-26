import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import carRoutes from "./car.routes.js";
import bookingRoutes from "./booking.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/cars", carRoutes);
router.use("/bookings", bookingRoutes);

export default router;
