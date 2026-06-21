export function notFound(req, res, next) {
  res.status(404).json({ message: `Not found: ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  let status = err.statusCode || res.statusCode >= 400 ? res.statusCode : 500;
  if (status < 400) status = 500;
  let message = err.message || "Server error";

  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  }
  if (err.code === 11000) {
    status = 400;
    message = `Duplicate value for: ${Object.keys(err.keyValue).join(", ")}`;
  }
  if (err.name === "CastError") {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (process.env.NODE_ENV !== "production") console.error("❌", err);
  res.status(status).json({ message });
}
