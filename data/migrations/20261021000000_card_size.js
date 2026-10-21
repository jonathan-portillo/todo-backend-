// How big a list's card is on the dashboard (px). Null means the default size.
exports.up = function (knex) {
  return knex.schema.alterTable("todo_title", (tbl) => {
    tbl.integer("width").nullable();
    tbl.integer("height").nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("todo_title", (tbl) => {
    tbl.dropColumn("width");
    tbl.dropColumn("height");
  });
};
