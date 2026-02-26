import { ApiError } from "../utils/ApiError.js";

/**
 * Middleware factory that validates req.body against a Zod schema.
 * Returns 400 with validation error details on failure.
 */
const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      throw new ApiError(400, "Validation failed", errors);
    }

    req.body = result.data;
    next();
  };
};

export default validate;
