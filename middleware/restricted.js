const jwt = require("jsonwebtoken");
const secret = require("../auth/config/secret");

module.exports = restricted;

// Requires a valid login token in the Authorization header and sets req.user.
function restricted(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.replace(/^Bearer\s+/i, "");

  if (!token) {
    return res.status(401).json({ message: "Please sign in again.", field: "form" });
  }

  jwt.verify(token, secret.jwtSecret, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ message: "Your session has expired. Please sign in again.", field: "form" });
    }
    req.user = { id: decoded.subject, username: decoded.username };
    next();
  });
}
