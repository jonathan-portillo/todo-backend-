const todo = require("../api/todo/toto-list/todo_list_model");

module.exports = {
  validateTodo,
  validateTodoID,
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
    res.status(400).json({ message: "You did not add a todo" });
  } else {
    next();
  }
}
