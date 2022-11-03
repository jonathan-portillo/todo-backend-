const todo = require("../api/todo/toto-list/todo_list_model");

module.exports = {
  validateTodo,
  validateTodoID,
  validateTodoInList,
};

function validateTodoID(req, res, next) {
  const { id } = req.params;

  todo
    .findTodoListById(id)
    .then((todo) => {
      if (!todo) {
        res.status(400).json({ message: "invalid todo, todo does not exist" });
      } else {
        next();
      }
    })
    .catch((err) => {
      console.log("Error getting id", err);
    });
}

function validateTodo(req, res, next) {
  if (!req.body.todo_list) {
    res.status(400).json({ message: "Todo not found!" });
  } else {
    next();
  }
}

async function validateTodoInList(req, res, next) {
  const { id } = req.params;

  const todolist = await todo.findTodoListByTitleId(id);

  if (todolist.length === 0) {
    res
      .status(404)
      .json("There's nothing here. Lets put down something to do!!");
    console.log(todolist);
  } else {
    next();
  }
}
