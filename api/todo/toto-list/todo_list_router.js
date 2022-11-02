const router = require("express").Router();
const todoList = require("./todo_list_model");

//get an entire list of all todoLists on the site
router.get("/", (req, res) => {
  todoList
    .findAllTodoList()
    .then((todoList) => {
      res.status(200).json(todoList);
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
});

//list on it's id
router.get("/:id", (req, res) => {
  const todoListId = req.params.id;
  todoList
    .findTodoListById(todoListId)
    .then((list) => {
      res.status(200).json(list);
    })
    .catch((err) => {
      res.send(err);
    });
});

router.get("/:id/title", (req, res) => {
  todoList
    .findTodoListByTitleId(req.params.id)
    .then((title) => {
      res.status(200).json(title);
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
});

//create a todo list that is tied to the todoTitle_id
router.post("/:id/todo_title", (req, res) => {
  const newTodoList = {
    todo_title_id: req.params.id,
    todo_list: req.body.todo_list,
  };
  todoList
    .addTodoList(newTodoList)
    .then((todoList) => {
      res.status(201).json(todoList);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({
        message:
          "Problem creating a todo list, good luck getting through the day! ",
      });
    });
});

//update todo list
router.put("/:id", (req, res) => {
  const updatedTodoList = {
    todo_list: req.body.todo_list,
  };
  todoList
    .updateTodoList(req.body, req.params.id)
    .then(() => {
      res.status(201).json({
        message: `Your todo list has been updated`,
        updatedTodoList,
      });
    })
    .catch((err) => {
      console.log(err);
      res.json(400).json({ message: "Problem updating todo list" });
    });
});

router.delete("/:id", (req, res) => {
  todoList.deleteTodo(req.params.id).then(() => {
    res.status(200).json({ message: "Your to do has been deleted" });
  });
});

module.exports = router;
