const db = require("../../../data/db-config");

module.exports = {
  find,
  // findBy,
  findTitleByUser,
  findTitleById,
  addTitle,
  updateTitle,
  deleteTodoList,
  findTrashByUser,
  trashTitle,
  restoreTitle,
  moveTitle,
  moveToBoard,
  resizeTitle,
};

//find all Note Titles
function find() {
  return db("todo_title");
}

//find Note titles by Id
function findTitleById(id) {
  return db("todo_title").where({ id }).first();
}

//find todo titles by the user id
async function findTitleByUser(id) {
  try {
    const title = await db("todo_title as tt")
      .join("users as u", "u.id", "tt.user_id")
      .where({ "tt.user_id": id })
      .whereNull("tt.deleted_at")
      .select(
        "tt.id",
        "u.username",
        "tt.todo_title",
        "tt.user_id",
        "tt.pos_x",
        "tt.pos_y",
        "tt.board_id",
        "tt.width",
        "tt.height"
      );
    return title;
  } catch (err) {
    throw err;
  }
}

//find the trashed todo titles for a user, most recently deleted first
function findTrashByUser(id) {
  return db("todo_title as tt")
    .join("users as u", "u.id", "tt.user_id")
    .where({ "tt.user_id": id })
    .whereNotNull("tt.deleted_at")
    .orderBy("tt.deleted_at", "desc")
    .select(
      "tt.id",
      "u.username",
      "tt.todo_title",
      "tt.user_id",
      "tt.deleted_at"
    );
}

//move a todo title to the trash
function trashTitle(id) {
  return db("todo_title").where({ id }).update({ deleted_at: db.fn.now() });
}

//take a todo title back out of the trash
function restoreTitle(id) {
  return db("todo_title").where({ id }).update({ deleted_at: null });
}

//save where a todo title's card sits on the dashboard
function moveTitle(id, pos_x, pos_y) {
  return db("todo_title").where({ id }).update({ pos_x, pos_y });
}

//save how big a todo title's card is on the dashboard
function resizeTitle(id, width, height) {
  return db("todo_title").where({ id }).update({ width, height });
}

//move a todo title to another board (tab); it gets a fresh spot there
async function moveToBoard(id, boardId) {
  const board = await db("boards").where({ id: boardId }).first();
  const item = await db("todo_title").where({ id }).first();
  if (!board || !item || board.user_id !== item.user_id) return null;
  await db("todo_title")
    .where({ id })
    .update({ board_id: boardId, pos_x: null, pos_y: null });
  return findTitleById(id);
}

//create a new Note Title
async function addTitle(newTitle) {
  const [id] = await db("todo_title").insert(newTitle, "id");
  return findTitleById(id);
}

//update todo Title

function updateTitle(changes, id) {
  return db("todo_title").where({ id }).update(changes);
}

//permanently delete todo list (its notes go with it)

function deleteTodoList(id) {
  return db("todo_title").del().where({ id });
}
