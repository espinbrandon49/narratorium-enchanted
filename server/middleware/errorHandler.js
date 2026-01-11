const AppError = require("../utils/AppError");

module.exports = function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-unused-vars
  const isAppError = err instanceof AppError;

  const status = isAppError ? err.status : 500;
  const code = isAppError ? err.code : "INTERNAL_SERVER_ERROR";
  const message = isAppError ? err.message : "Unexpected server error";

  // Include details only for AppError (and only if present)
  const details = isAppError ? err.details : undefined;

  // Log server-side for debugging (don’t leak stack to client)
  if (!isAppError) {
    console.error(err);
  }

  return res.status(status).json({
    ok: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  });
};
