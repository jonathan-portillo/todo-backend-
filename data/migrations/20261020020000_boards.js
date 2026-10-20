// Boards are the tabs on the dashboard. Each list (todo_title) belongs to one board.
// Lists created before boards existed have board_id = null; they are adopted by the
// user's first board the first time boards are loaded.
exports.up = async function (knex) {
  await knex.schema.createTable("boards", (tbl) => {
    tbl.increments();
    tbl.string("name", 64).notNullable();
    tbl
      .integer("user_id")
      .references("users.id")
      .notNullable()
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });
  await knex.schema.alterTable("todo_title", (tbl) => {
    tbl.integer("board_id").nullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("todo_title", (tbl) => {
    tbl.dropColumn("board_id");
  });
  await knex.schema.dropTableIfExists("boards");
};
