class AppError extends Error {
  /**
   * @param {string} code - stable error code (e.g. "UNAUTHORIZED")
   * @param {string} message - human-readable message
   * @param {number} status - HTTP status
   * @param {any} [details] - optional details payload
   */
  constructor(code, message, status = 400, details = undefined) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

module.exports = AppError;
