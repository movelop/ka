export const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.status = statusCode; // backward compatibility
  return error;
};


export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Something went wrong";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
};
