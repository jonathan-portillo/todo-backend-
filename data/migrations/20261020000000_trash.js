// Soft delete: a trashed list keeps its row (and notes) with a deleted_at timestamp.
exports.up = function (knex) {
  return knex.schema.alterTable("todo_title", (tbl) => {
    tbl.datetime("deleted_at").nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("todo_title", (tbl) => {
    tbl.dropColumn("deleted_at");
  });
};
