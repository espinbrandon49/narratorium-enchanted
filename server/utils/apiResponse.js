function ok(res, data = null, status = 200) {
  return res.status(status).json({ ok: true, data });
}

function fail(res, error, status = 400) {
  // error can be: string OR { code, message, details? }
  const normalized =
    typeof error === "string"
      ? { code: "BAD_REQUEST", message: error }
      : {
        code: error.code || "BAD_REQUEST",
        message: error.message || "Request failed",
        details: error.details,
      };

  return res.status(status).json({ ok: false, error: normalized });
}

module.exports = { ok, fail };
