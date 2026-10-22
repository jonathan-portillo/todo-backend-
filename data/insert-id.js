const db = require("./db-config");

// Insert a row and return its new id. Postgres hands back [{ id }] while SQLite
// hands back [id], so this hides the difference.
module.exports = async function insertId(table, row) {
  const [result] = await db(table).insert(row, "id");
  return result !== null && typeof result === "object" ? result.id : result;
};
