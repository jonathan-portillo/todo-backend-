// SQLite ignores column lengths but Postgres enforces them, so give the checklist
// text room to grow. SQLite databases are left alone.
exports.up = async function (knex) {
  if (knex.client.config.client !== "pg") return;
  await knex.raw('ALTER TABLE todo_list ALTER COLUMN todo_list TYPE text');
};

exports.down = async function () {};
