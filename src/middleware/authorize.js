import { ApiError } from "../utils/ApiError.js";

/**
 * Middleware factory that restricts access to users with specific roles.
 * Must be used after authMiddleware (requires req.user to be set).
 *
 * @param  {...string} roles - Allowed roles (e.g., "admin", "user")
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        "You do not have permission to perform this action"
      );
    }

    next();
  };
};

export default authorize;
