function errorHandler(err, req, res, _next) {
  if (err?.type === "entity.too.large") {
    res.status(413).json({
      success: false,
      message: "Request is too large.",
    });
    return;
  }

  if (
    err?.type === "entity.parse.failed" ||
    (err instanceof SyntaxError && err.status === 400)
  ) {
    res.status(400).json({
      success: false,
      message: "Invalid request body.",
    });
    return;
  }

  const statusCode = err.statusCode || err.status || 500;
  const isServerError = statusCode >= 500;
  const message = isServerError
    ? err.statusCode
      ? err.message
      : "Internal server error"
    : err.message || "Request failed";

  const payload = {
    success: false,
    message,
  };
  if (typeof err.code === "string" && err.code.length > 0) {
    payload.code = err.code;
  }
  res.status(statusCode).json(payload);
}

module.exports = errorHandler;
