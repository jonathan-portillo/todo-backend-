// Update with your config settings.

const sqlite = {
  client: "sqlite3",
  useNullAsDefault: true,
  connection: {
    filename: "./data/todo_list.db3",
  },
  pool: {
    afterCreate: (conn, done) => {
      conn.run("PRAGMA foreign_keys = ON", done);
    },
  },
  migrations: {
    directory: "./data/migrations",
  },
  seeds: { directory: "./data/seeds" },
};

// With DATABASE_URL set (production, or a local Postgres) the app uses Postgres.
// Without it, it falls back to a local SQLite file so development needs no setup.
const postgres = {
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
    // hosted databases need TLS; set DATABASE_SSL=off for a local Postgres
    ssl: process.env.DATABASE_SSL === "off" ? false : { rejectUnauthorized: true },
  },
  pool: { min: 0, max: 5 },
  migrations: {
    directory: "./data/migrations",
  },
  seeds: { directory: "./data/seeds" },
};

const config = process.env.DATABASE_URL ? postgres : sqlite;

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: config,
  production: config,
};
