const secret = process.env.JWT_SECRET;

if (!secret && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET must be set in production.");
}

module.exports = {
  // the fallback is only for local development
  jwtSecret: secret || "dev-only-secret-change-me",
};
