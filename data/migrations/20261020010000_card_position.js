// Where a list's card sits on the dashboard canvas (px). Null means "not placed yet".
exports.up = function (knex) {
  return knex.schema.alterTable("todo_title", (tbl) => {
    tbl.integer("pos_x").nullable();
    tbl.integer("pos_y").nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("todo_title", (tbl) => {
    tbl.dropColumn("pos_x");
    tbl.dropColumn("pos_y");
  });
};
