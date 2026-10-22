const db = require("../data/db-config");

// Use after `restricted`. Each check lets the request through only when the
// record in the URL belongs to the signed-in user. Records that don't exist and
// records that belong to someone else get the same 404, so ids can't be probed.

//routes shaped /user/:id, where :id is the account itself
function ownUserParam(req, res, next) {
  if (String(req.params.id) !== String(req.user.id)) {
    return res.status(403).json({ message: "That isn't your account." });
  }
  next();
}

// Postgres rejects ids that aren't plain integers, so check before querying
const isId = (id) => /^\d{1,9}$/.test(String(id));

const owns = (findOwnerId) => async (req, res, next) => {
  if (!isId(req.params.id)) {
    return res.status(404).json({ message: "Not found." });
  }
  try {
    const ownerId = await findOwnerId(req.params.id);
    if (ownerId == null || String(ownerId) !== String(req.user.id)) {
      return res.status(404).json({ message: "Not found." });
    }
    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

const ownTitle = owns(async (id) => {
  const row = await db("todo_title").where({ id }).first("user_id");
  return row && row.user_id;
});

const ownBoard = owns(async (id) => {
  const row = await db("boards").where({ id }).first("user_id");
  return row && row.user_id;
});

const ownTodo = owns(async (id) => {
  const row = await db("todo_list as tl")
    .join("todo_title as tt", "tt.id", "tl.todo_title_id")
    .where("tl.id", id)
    .first("tt.user_id");
  return row && row.user_id;
});

const ownDescription = owns(async (id) => {
  const row = await db("description as d")
    .join("todo_list as tl", "tl.id", "d.todo_list_id")
    .join("todo_title as tt", "tt.id", "tl.todo_title_id")
    .where("d.id", id)
    .first("tt.user_id");
  return row && row.user_id;
});

module.exports = {
  ownUserParam,
  ownTitle,
  ownBoard,
  ownTodo,
  ownDescription,
};
