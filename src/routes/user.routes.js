import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import authorize from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import { updateUserSchema } from "../validators/user.validator.js";
import { ROLES } from "../constants.js";

const router = Router();

// All user routes require authentication
router.use(authMiddleware);

router.get("/", authorize(ROLES.ADMIN), getAllUsers);
router.get("/:id", authorize(ROLES.ADMIN), getUserById);
router.patch("/:id", validate(updateUserSchema), updateUser);
router.delete("/:id", deleteUser);

export default router;
