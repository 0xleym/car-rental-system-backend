import { Router } from "express";
import {
  getAllCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
} from "../controllers/car.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import authorize from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import {
  createCarSchema,
  updateCarSchema,
} from "../validators/car.validator.js";
import { ROLES } from "../constants.js";

const router = Router();

// Public routes
router.get("/", getAllCars);
router.get("/:id", getCarById);

// Admin-only routes
router.post(
  "/",
  authMiddleware,
  authorize(ROLES.ADMIN),
  validate(createCarSchema),
  createCar
);
router.patch(
  "/:id",
  authMiddleware,
  authorize(ROLES.ADMIN),
  validate(updateCarSchema),
  updateCar
);
router.delete("/:id", authMiddleware, authorize(ROLES.ADMIN), deleteCar);

export default router;
