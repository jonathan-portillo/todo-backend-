const knex = require("knex");

const knexfile = require("../knexfile");
const enviornment = process.env.DB_ENV || process.env.NODE_ENV || "development";

module.exports = knex(knexfile[enviornment] || knexfile.development);
