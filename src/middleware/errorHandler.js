import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }
  console.error("Unhandled error:", err);
  return res.status(500).json({
    success: false,
    error: "Internal server error",
  });
};

export default errorHandler;
