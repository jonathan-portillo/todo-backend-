const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secret = require("./config/secret");
const { isValid } = require("../middleware/valid");
const restricted = require("../middleware/restricted");

const router = require("express").Router();
const users = require("../api/users/users-model");

router.post("/register", async (req, res) => {
  const cred = req.body;

  if (!isValid(cred)) {
    return res
      .status(400)
      .json({ message: "Enter a username and a password.", field: "form" });
  }

  try {
    const existing = await users.findBy({ username: cred.username }).first();
    if (existing) {
      return res.status(409).json({
        message: "That username is already taken. Try signing in instead.",
        field: "username",
      });
    }

    const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 8;
    const hash = bcryptjs.hashSync(cred.password, rounds);
    const user = await users.add({ username: cred.username, password: hash });
    const token = generateToken(user);
    res
      .status(201)
      .json({ id: `${user.id}`, cred: { username: user.username }, token });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again.", field: "form" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password || typeof password !== "string") {
    return res
      .status(400)
      .json({ message: "Enter your username and password.", field: "form" });
  }

  try {
    const user = await users.findBy({ username }).first();

    if (!user) {
      return res.status(401).json({
        message: "We couldn't find an account with that username.",
        field: "username",
      });
    }
    if (!bcryptjs.compareSync(password, user.password)) {
      return res
        .status(401)
        .json({ message: "That password is incorrect.", field: "password" });
    }

    const token = generateToken(user);
    res.status(201).json({
      id: `${user.id}`,
      message: `Welcome ${user.username}`,
      token: token,
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again.", field: "form" });
  }
});

const MIN_PASSWORD = 8;

// load the signed-in user and confirm their current password
const confirmPassword = async (req, res, password) => {
  const user = await users.findBy({ id: req.user.id }).first();
  if (!user) {
    res.status(401).json({ message: "Please sign in again.", field: "form" });
    return null;
  }
  if (typeof password !== "string" || !bcryptjs.compareSync(password, user.password)) {
    res
      .status(401)
      .json({ message: "That password is incorrect.", field: "password" });
    return null;
  }
  return user;
};

router.put("/username", restricted, async (req, res) => {
  const { newUsername, password } = req.body;
  const username = typeof newUsername === "string" ? newUsername.trim() : "";

  if (!username || username.length > 128) {
    return res
      .status(400)
      .json({ message: "Enter a new username.", field: "username" });
  }

  try {
    const user = await confirmPassword(req, res, password);
    if (!user) return;

    if (username !== user.username) {
      const taken = await users.findBy({ username }).first();
      if (taken) {
        return res.status(409).json({
          message: "That username is already taken.",
          field: "username",
        });
      }
      await users.update(user.id, { username });
    }

    const token = generateToken({ id: user.id, username });
    res.status(200).json({ username, token });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again.", field: "form" });
  }
});

router.put("/password", restricted, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (typeof newPassword !== "string" || newPassword.length < MIN_PASSWORD) {
    return res.status(400).json({
      message: `New password must be at least ${MIN_PASSWORD} characters.`,
      field: "newPassword",
    });
  }

  try {
    const user = await confirmPassword(req, res, currentPassword);
    if (!user) return;

    const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 8;
    await users.update(user.id, {
      password: bcryptjs.hashSync(newPassword, rounds),
    });
    res.status(200).json({ message: "Password updated." });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again.", field: "form" });
  }
});

const generateToken = (user) => {
  const payload = {
    subject: user.id,
    username: user.username,
  };
  const options = { expiresIn: "1d" };
  return jwt.sign(payload, secret.jwtSecret, options);
};

module.exports = router;
