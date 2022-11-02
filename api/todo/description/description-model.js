const db = require("../../../data/db-config");

module.exports = {
  find,
  findDescriptionByList,
  findDescriptionById,
  addDescription,
  updateDescription,
  deleteDescription,
};

//find all description to lists
function find() {
  return db("description");
}

async function findDescriptionByList(id) {
  try {
    const description = await db("description as d")
      .join("todo_list as tl", "tl.id", "d.todo_list_id")
      .where({ "d.todo_list_id": id })
      .select("d.id", "d.description", "tl.todo_list", "d.todo_list_id");
    return description;
  } catch (err) {
    throw err;
  }
}

//find description by Id
function findDescriptionById(id) {
  return db("description").where({ id }).first();
}

//add a new description
async function addDescription(newDescription) {
  const [id] = await db("description").insert(newDescription, "id");
  return findDescriptionById(id);
}

//update description
function updateDescription(changes, id) {
  return db("description").where({ id }).update(changes);
}

//delete description
function deleteDescription(id) {
  return db("description").del().where({ id });
}
