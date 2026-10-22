const router = require("express").Router();
const boards = require("./boards-model");
const { ownUserParam, ownBoard } = require("../../../middleware/ownership");

const cleanName = (name) =>
  typeof name === "string" ? name.trim().slice(0, 64) : "";

const validateBoardID = (req, res, next) => {
  boards
    .findBoardById(req.params.id)
    .then((board) => {
      if (!board) {
        res.status(400).json({ message: "invalid board id, board does not exist" });
      } else {
        req.board = board;
        next();
      }
    })
    .catch(() => res.status(400).json({ message: "Problem finding board" }));
};

//get the boards (tabs) for a user
router.get("/user/:id", ownUserParam, (req, res) => {
  boards
    .findBoardsByUser(req.params.id)
    .then((list) => res.status(200).json(list))
    .catch((err) => {
      console.log(err);
      res.status(400).json({ message: "Problem getting boards" });
    });
});

//create a board for a user
router.post("/user/:id", ownUserParam, (req, res) => {
  const name = cleanName(req.body.name);
  if (!name) return res.status(400).json({ message: "A board needs a name" });
  boards
    .addBoard(req.params.id, name)
    .then((board) => res.status(201).json(board))
    .catch((err) => {
      console.log(err);
      res.status(400).json({ message: "Problem creating board" });
    });
});

//rename a board
router.put("/:id", ownBoard, validateBoardID, (req, res) => {
  const name = cleanName(req.body.name);
  if (!name) return res.status(400).json({ message: "A board needs a name" });
  boards
    .renameBoard(req.params.id, name)
    .then((board) => res.status(200).json(board))
    .catch((err) => {
      console.log(err);
      res.status(400).json({ message: "Problem renaming board" });
    });
});

//delete a board; its lists go to the trash. The last board can't be deleted.
router.delete("/:id", ownBoard, validateBoardID, async (req, res) => {
  try {
    const all = await boards.findBoardsByUser(req.board.user_id);
    if (all.length <= 1) {
      return res.status(400).json({ message: "You need at least one tab" });
    }
    await boards.deleteBoard(req.params.id);
    res.status(200).json({ message: "Board deleted, its lists are in the trash" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Problem deleting board" });
  }
});

module.exports = router;
