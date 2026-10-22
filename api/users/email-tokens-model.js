const crypto = require("crypto");
const db = require("../../data/db-config");

module.exports = { issue, consume, lastIssuedAt };

// Only a hash is stored, so a copy of the database can't be used to reset anyone's password.
const hash = (token) => crypto.createHash("sha256").update(token).digest("hex");

// Make a fresh token for a user. Any unused one of the same type stops working.
async function issue({ userId, type, newEmail = null, ttlMs }) {
  await db("email_tokens")
    .where({ user_id: userId, type })
    .whereNull("used_at")
    .del();
  const token = crypto.randomBytes(32).toString("hex");
  const now = Date.now();
  await db("email_tokens").insert({
    user_id: userId,
    type,
    token_hash: hash(token),
    new_email: newEmail,
    expires_at: new Date(now + ttlMs),
    created_at: new Date(now),
  });
  return token;
}

// Use a token once. Returns its row, or null if it is wrong, expired or already used.
async function consume(token, type) {
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) return null;
  const row = await db("email_tokens")
    .where({ token_hash: hash(token), type })
    .whereNull("used_at")
    .where("expires_at", ">", new Date())
    .first();
  if (!row) return null;
  // the update only succeeds for one caller, even if two requests arrive together
  const claimed = await db("email_tokens")
    .where({ id: row.id })
    .whereNull("used_at")
    .update({ used_at: new Date() });
  return claimed === 1 ? row : null;
}

// When this user was last sent a token of this type, for a short cool-down.
async function lastIssuedAt(userId, type) {
  const row = await db("email_tokens")
    .where({ user_id: userId, type })
    .whereNull("used_at")
    .orderBy("id", "desc")
    .first("created_at");
  return row ? new Date(row.created_at).getTime() : 0;
}
