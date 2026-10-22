const db = require("../../data/db-config");
const insertId = require("../../data/insert-id");

module.exports = {
  find,
  findBy,
  findById,
  add,
  update,
};

async function find() {
  return await db("users").select("id", "username").orderBy("id");
}

function findBy(filter) {
  return db("users").where(filter).orderBy("id");
}

function findById(id) {
  return db("users").where({ id }).first().select("id", "username");
}

async function add(user) {
  const id = await insertId("users", user);
  return findById(id);
}

// changes can be { username } or { password }
function update(id, changes) {
  return db("users").where({ id }).update(changes);
}
