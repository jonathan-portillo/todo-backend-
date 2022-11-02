const router = require("express").Router();
const users = require("./users-model");

//get users
router.get("/", (req, res) => {
  users
    .find()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
});

module.exports = router;
