const router = require("express").Router();
const title = require("./todo_title-model");
const {
  validateTitleID,
  validateTitle,
} = require("../../../middleware/title-middleware");

// x can be negative: cards may sit left of the dashboard column. y starts at the top.
const isNum = (n) => typeof n === "number" && Number.isFinite(n);
const isCoordX = isNum;
const isCoordY = (n) => isNum(n) && n >= 0;

//get every single todo title created!!
router.get("/", (req, res) => {
  title
    .find()
    .then((title) => {
      res.status(200).json(title);
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
});

//get todo title based on user_id
router.get("/user/:id", (req, res) => {
  title
    .findTitleByUser(req.params.id)
    .then((userTitle) => {
      res.status(200).json(userTitle);
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
});

//get the trashed todo titles for a user
router.get("/user/:id/trash", (req, res) => {
  title
    .findTrashByUser(req.params.id)
    .then((trash) => {
      res.status(200).json(trash);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ message: "Problem getting the trash" });
    });
});

//get todo based on titleid
router.get("/:id", validateTitleID, (req, res) => {
  const titleId = req.params.id;
  title
    .findTitleById(titleId)
    .then((title) => {
      res.status(200).json(title);
    })
    .catch((err) => {
      res.send(err);
    });
});

//create a todo list that is tied to the user_id
router.post("/user/:id/", validateTitle, (req, res) => {
  const newTodoTitle = {
    user_id: req.params.id,
    todo_title: req.body.todo_title,
  };
  if (Number.isInteger(req.body.board_id)) {
    newTodoTitle.board_id = req.body.board_id;
  }
  if (isCoordX(req.body.pos_x) && isCoordY(req.body.pos_y)) {
    newTodoTitle.pos_x = Math.round(req.body.pos_x);
    newTodoTitle.pos_y = Math.round(req.body.pos_y);
  }
  title
    .addTitle(newTodoTitle)
    .then((title) => {
      res.status(201).json(title);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ message: "Problem creating a todolist title" });
    });
});

//update the todo list title

router.put("/:id", validateTitleID, validateTitle, (req, res) => {
  const updatedTitle = {
    todo_title: req.body.todo_title,
  };
  title
    .updateTitle(req.body, req.params.id)
    .then(() => {
      res.status(201).json({
        message: `Your new Title is updated `,
        updatedTitle,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ message: "Problem updating title" });
    });
});

//move the todo list to the trash
router.delete("/:id", validateTitleID, (req, res) => {
  title
    .trashTitle(req.params.id)
    .then(() => {
      res.status(200).json({ message: "Todo List moved to trash" });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ message: "Problem moving list to trash" });
    });
});

//save where the todo list's card sits on the dashboard
router.put("/:id/position", validateTitleID, (req, res) => {
  const { pos_x, pos_y } = req.body;
  if (!isCoordX(pos_x) || !isCoordY(pos_y)) {
    return res.status(400).json({ message: "pos_x and pos_y must be numbers" });
  }
  title
    .moveTitle(req.params.id, Math.round(pos_x), Math.round(pos_y))
    .then(() => {
      res.status(200).json({ pos_x: Math.round(pos_x), pos_y: Math.round(pos_y) });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ message: "Problem saving position" });
    });
});

//move the todo list to another board (tab)
router.put("/:id/board", validateTitleID, (req, res) => {
  if (!Number.isInteger(req.body.board_id)) {
    return res.status(400).json({ message: "board_id must be a number" });
  }
  title
    .moveToBoard(req.params.id, req.body.board_id)
    .then((moved) => {
      if (!moved) {
        return res.status(400).json({ message: "That board isn't yours or doesn't exist" });
      }
      res.status(200).json(moved);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ message: "Problem moving list" });
    });
});

//restore a todo list from the trash
router.put("/:id/restore", validateTitleID, (req, res) => {
  title
    .restoreTitle(req.params.id)
    .then(() => title.findTitleById(req.params.id))
    .then((restored) => {
      res.status(200).json(restored);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ message: "Problem restoring list" });
    });
});

//permanently delete a todo list
router.delete("/:id/permanent", validateTitleID, (req, res) => {
  title
    .deleteTodoList(req.params.id)
    .then(() => {
      res.status(200).json({ message: "Todo List deleted forever" });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ message: "Problem deleting list" });
    });
});

module.exports = router;
