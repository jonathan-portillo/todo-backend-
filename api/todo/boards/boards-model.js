const db = require("../../../data/db-config");

module.exports = {
  findBoardById,
  findBoardsByUser,
  addBoard,
  renameBoard,
  deleteBoard,
};

function findBoardById(id) {
  return db("boards").where({ id }).first();
}

// A user always has at least one board. Lists that predate boards (or whose board was
// deleted) are adopted by the first one.
async function findBoardsByUser(userId) {
  let boards = await db("boards").where({ user_id: userId }).orderBy("id");
  if (!boards.length) {
    await db("boards").insert({ name: "My tasks", user_id: userId });
    boards = await db("boards").where({ user_id: userId }).orderBy("id");
  }
  await db("todo_title")
    .where({ user_id: userId })
    .whereNull("board_id")
    .update({ board_id: boards[0].id });
  return boards;
}

async function addBoard(userId, name) {
  const [id] = await db("boards").insert({ name, user_id: userId }, "id");
  return findBoardById(id);
}

async function renameBoard(id, name) {
  await db("boards").where({ id }).update({ name });
  return findBoardById(id);
}

// Deleting a board moves its lists to the trash; they come back to the first board
// if restored.
async function deleteBoard(id) {
  await db("todo_title")
    .where({ board_id: id })
    .whereNull("deleted_at")
    .update({ deleted_at: db.fn.now() });
  await db("todo_title").where({ board_id: id }).update({ board_id: null });
  return db("boards").where({ id }).del();
}
