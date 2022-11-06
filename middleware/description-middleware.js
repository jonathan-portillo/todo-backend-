const description = require("../api/todo/description/description-model");

module.exports = {
  validateDescription,
  validateDescriptionID,
  validateDescriptionsForTodo,
};

//ensure that there is a description being posted when submiting the POST request
function validateDescription(req, res, next) {
  if (!req.body.description) {
    res.status(400).json({ message: "Descrition not added!" });
  } else {
    next();
  }
}

//ensuring that the endpoints is using an existing description id
function validateDescriptionID(req, res, next) {
  const { id } = req.params;

  description
    .findDescriptionById(id)
    .then((description) => {
      if (!description) {
        res.status(400).json({
          message: "Invalid description, description does not exist",
        });
      } else {
        next();
      }
    })
    .catch((err) => {
      console.log("Error getting id", err);
    });
}

//checks to see if there are descriptions added to a todo, if not it shoots out "There is no description lets add one."
async function validateDescriptionsForTodo(req, res, next) {
  const { id } = req.params;

  const descriptions = await description.findDescriptionByList(id);

  if (descriptions.length === 0) {
    res.status(404).json("Theres no description lets add one!!");
    console.log(descriptions);
  } else {
    next();
  }
}
