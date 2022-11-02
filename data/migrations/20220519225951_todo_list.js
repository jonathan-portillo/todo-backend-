exports.up = function (knex) {
  return knex.schema
    .createTable("users", (tbl) => {
      tbl.increments();
      tbl.string("username", 128).notNullable().unique().index();
      tbl.string("password", 256).notNullable().index();
    })
    .createTable("todo_title", (tbl) => {
      tbl.increments();
      tbl.string("todo_title", 128).notNullable();
      tbl
        .integer("user_id")
        .references("users.id")
        .notNullable()
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
    })
    .createTable("todo_list", (tbl) => {
      tbl.increments();
      tbl.string("todo_list", 300),
        tbl
          .integer("todo_title_id")
          .references("todo_title.id")
          .notNullable()
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
    })
    .createTable("description", (tbl) => {
      tbl.increments();
      tbl.string("description", 2000),
        tbl
          .integer("todo_list_id")
          .references("todo_list.id")
          .notNullable()
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("users")
    .dropTableIfExists("todo_title")
    .dropTableIfExists("todo_list")
    .dropTableIfExists("description");
};
