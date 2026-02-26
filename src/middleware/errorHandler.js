import { ApiError } from "../utils/ApiError.js";
import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(err.errors.length > 0 && { errors: err.errors }),
    });
  }

  logger.error(
    { err, method: req.method, url: req.originalUrl },
    "Unhandled error"
  );

  return res.status(500).json({
    success: false,
    error: "Internal server error",
  });
};

export default errorHandler;
