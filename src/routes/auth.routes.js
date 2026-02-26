import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import { authLimiter } from "../app.js";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.get("/me", authMiddleware, getMe);

export default router;
