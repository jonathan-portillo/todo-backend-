const db = require("../../../data/db-config");

module.exports = {
  findAllTodoList,
  findTodoListById,
  findTodoListByTitleId,
  addTodoList,
  updateTodoList,
  deleteTodo,
};

// find all the todoLists
function findAllTodoList() {
  return db("todo_list");
}

//find todolist by the id
function findTodoListById(id) {
  return db("todo_list").where({ id }).first();
}

//find todolist by title_id
async function findTodoListByTitleId(id) {
  try {
    const list = await db("todo_list as tl")
      .join("todo_title as tt", "tt.id", "tl.todo_title_id")
      .where({ "tl.todo_title_id": id })
      .select("tl.id", "tl.todo_list", "tl.todo_title_id");
    return list;
  } catch (err) {
    throw err;
  }
}

async function addTodoList(newTodoList) {
  const [id] = await db("todo_list").insert(newTodoList, "id");
  return findTodoListById(id);
}

function updateTodoList(changes, id) {
  return db("todo_list").where({ id }).update(changes);
}

function deleteTodo(id) {
  return db("todo_list").del().where({ id });
}
