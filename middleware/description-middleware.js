const description = require("../api/todo/description/description-model");

module.exports = {
  validateDescription,
  validateDescriptionID,
};

function validateDescription(req, res, next) {
  if (!req.body.description) {
    res.status(400).json({ message: "Descrition not added!" });
  } else {
    next();
  }
}

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
