// users.email only ever holds an address the user has confirmed, so it is safe to send
// password resets to. A pending address lives in email_tokens until the link is clicked.
exports.up = async function (knex) {
  await knex.schema.alterTable("users", (tbl) => {
    tbl.string("email", 254).nullable().unique();
  });
  await knex.schema.createTable("email_tokens", (tbl) => {
    tbl.increments();
    tbl
      .integer("user_id")
      .references("users.id")
      .notNullable()
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    tbl.string("type", 16).notNullable(); // "verify" or "reset"
    tbl.string("token_hash", 64).notNullable().index(); // sha256; the raw token is only in the email
    tbl.string("new_email", 254).nullable(); // the address being confirmed, for "verify"
    tbl.timestamp("expires_at").notNullable();
    tbl.timestamp("used_at").nullable();
    tbl.timestamp("created_at").notNullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("email_tokens");
  await knex.schema.alterTable("users", (tbl) => {
    tbl.dropColumn("email");
  });
};
