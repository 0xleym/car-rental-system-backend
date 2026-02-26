import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Generate a JWT token for a user.
 */
const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

/**
 * POST /api/auth/register
 * Register a new user.
 */
export const register = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const exists = await User.exists(username);
  if (exists) {
    throw new ApiError(409, "Username already taken");
  }

  const user = await User.create(username, password);
  const token = generateToken(user);

  res
    .status(201)
    .json(
      new ApiResponse(201, { user, token }, "User registered successfully")
    );
});

/**
 * POST /api/auth/login
 * Authenticate a user and return a JWT.
 */
export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findByUsername(username);
  if (!user) {
    throw new ApiError(401, "Invalid username or password");
  }

  const isValid = await User.verifyPassword(password, user.password);
  if (!isValid) {
    throw new ApiError(401, "Invalid username or password");
  }

  const token = generateToken(user);

  // Don't return the password hash
  const { password: _, ...userWithoutPassword } = user;

  res.json(
    new ApiResponse(
      200,
      { user: userWithoutPassword, token },
      "Login successful"
    )
  );
});

/**
 * GET /api/auth/me
 * Get the current authenticated user's profile.
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.json(new ApiResponse(200, { user }, "Profile retrieved successfully"));
});
