const router = require("express").Router();
const description = require("./description-model");

//get a list of every single description
router.get("/", (req, res) => {
  description
    .find()
    .then((description) => {
      res.status(200).json(description);
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
});

//find description from todo list id
router.get("/:id/list", (req, res) => {
  description
    .findDescriptionByList(req.params.id)
    .then((description) => {
      res.status(200).json(description);
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
});

//get description by id
router.get("/:id", (req, res) => {
  const descripId = req.params.id;
  description
    .findDescriptionById(descripId)
    .then((description) => {
      res.status(200).json(description);
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
});

//post a description for a todo
router.post("/:id/list", (req, res) => {
  const newDescription = {
    todo_list_id: req.params.id,
    description: req.body.description,
  };
  description
    .addDescription(newDescription)
    .then((description) => {
      res.status(201).json(description);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({
        message: "Bruh this doesn't seem possible try this again sometime",
      });
    });
});

//update our description
router.put("/:id", (req, res) => {
  const update = {
    description: req.body.description,
  };
  description
    .updateDescription(req.body, req.params.id)
    .then(() => {
      res.status(201).json({
        message: "Description updated",
        update,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ message: "You broke it! Whomp whomp" });
    });
});

//delete our description
router.delete("/:id", (req, res) => {
  description.deleteDescription(req.params.id).then(() => {
    res.status(200).json({ message: "You have deleted your description" });
  });
});

module.exports = router;
