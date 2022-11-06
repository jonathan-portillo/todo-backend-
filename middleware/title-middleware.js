const title = require("../api/todo/todo-title/todo_title-model");

module.exports = {
  validateTitleID,
  validateTitle,
};

//ensuring that endpoints have an existing title id
function validateTitleID(req, res, next) {
  const { id } = req.params;

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
      console.log("Error getting id", err);
    });
}

//ensuring that end points are posting the proper json information for the title
function validateTitle(req, res, next) {
  if (!req.body.todo_title) {
    res.status(400).json({ message: "You did not add a title" });
  } else {
    next();
  }
}
