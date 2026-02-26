import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * GET /api/users
 * List all users (admin only).
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll();
  res.json(new ApiResponse(200, { users }, "Users retrieved successfully"));
});

/**
 * GET /api/users/:id
 * Get a user by ID (admin only).
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.json(new ApiResponse(200, { user }, "User retrieved successfully"));
});

/**
 * PATCH /api/users/:id
 * Update a user (owner or admin).
 */
export const updateUser = asyncHandler(async (req, res) => {
  const targetId = parseInt(req.params.id);

  // Users can only update themselves, admins can update anyone
  if (req.user.role !== "admin" && req.user.userId !== targetId) {
    throw new ApiError(403, "You can only update your own profile");
  }

  const existing = await User.findById(targetId);
  if (!existing) {
    throw new ApiError(404, "User not found");
  }

  // Check if new username is already taken (if updating username)
  if (req.body.username) {
    const taken = await User.exists(req.body.username);
    if (taken && req.body.username.toLowerCase() !== existing.username) {
      throw new ApiError(409, "Username already taken");
    }
  }

  const user = await User.update(targetId, req.body);
  res.json(new ApiResponse(200, { user }, "User updated successfully"));
});

/**
 * DELETE /api/users/:id
 * Delete a user (owner or admin).
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const targetId = parseInt(req.params.id);

  // Users can only delete themselves, admins can delete anyone
  if (req.user.role !== "admin" && req.user.userId !== targetId) {
    throw new ApiError(403, "You can only delete your own account");
  }

  const existing = await User.findById(targetId);
  if (!existing) {
    throw new ApiError(404, "User not found");
  }

  await User.delete(targetId);
  res.json(new ApiResponse(200, null, "User deleted successfully"));
});
