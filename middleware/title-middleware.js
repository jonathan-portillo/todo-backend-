const title = require("../api/todo/todo-title/todo_title-model");

module.exports = {
  validateTitleID,
  validateTitle,
};

function validateTitleID(req, res, next) {
  const { id } = req.params.id;

  title
    .findTitleById(id)
    .then((title) => {
      if (!title) {
        res
          .status(400)
          .json({ message: "invalid title id, title does not exist" });
      } else {
        next();
      }
    })
    .catch((err) => {
      consolelog("Error getting id", err);
    });
}

function validateTitle(req, res, next) {
  if (!req.body.todo_title) {
    res.status(400).json({ message: "You did not add a title" });
  } else {
    next();
  }
}
