module.exports = function notFound(req, res) {
  return res.status(404).json({
    ok: false,
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
    },
  });
};
