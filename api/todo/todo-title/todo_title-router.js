const router = require("express").Router();
const title = require("./todo_title-model");

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

//get todo based on titleid
router.get("/:id", (req, res) => {
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
router.post("/user/:id/", (req, res) => {
  const newTodoTitle = {
    user_id: req.params.id,
    todo_title: req.body.todo_title,
  };
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

router.put("/:id", (req, res) => {
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

//delete the todo list
router.delete("/:id", (req, res) => {
  title.deleteTodoList(req.params.id).then(() => {
    res.status(200).json({ message: "Todo List deleted!!!" });
  });
});
module.exports = router;
