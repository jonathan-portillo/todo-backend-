const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secret = require("./config/secret");
const { isValid } = require("../middleware/valid");
const restricted = require("../middleware/restricted");
const rateLimit = require("../middleware/rate-limit");
const mailer = require("../services/mailer");
const emailTokens = require("../api/users/email-tokens-model");

const router = require("express").Router();
const users = require("../api/users/users-model");

const MINUTES = 60 * 1000;
const loginLimit = rateLimit({ windowMs: 15 * MINUTES, max: 20 });
const registerLimit = rateLimit({ windowMs: 60 * MINUTES, max: 20 });
const forgotLimit = rateLimit({ windowMs: 15 * MINUTES, max: 5 });
const tokenLimit = rateLimit({ windowMs: 15 * MINUTES, max: 15 });

const VERIFY_TTL = 24 * 60 * MINUTES;
const RESET_TTL = 60 * MINUTES;
const RESEND_COOLDOWN = 60 * 1000;

const cleanEmail = (value) => {
  const email = typeof value === "string" ? value.trim().toLowerCase() : "";
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
};

// emails go out after the response, so a slow or failing mail service never
// changes what the user sees (and never reveals whether an address exists)
const inBackground = (job) =>
  Promise.resolve()
    .then(job)
    .catch((err) => console.log("Email problem:", err.message));

const sendVerification = async (user, email) => {
  const token = await emailTokens.issue({
    userId: user.id,
    type: "verify",
    newEmail: email,
    ttlMs: VERIFY_TTL,
  });
  await mailer.sendVerifyEmail(email, user.username, token);
};

router.post("/register", registerLimit, async (req, res) => {
  const cred = req.body;
  const email = cred.email ? cleanEmail(cred.email) : "";
  if (cred.email && !email) {
    return res
      .status(400)
      .json({ message: "That email address doesn't look right.", field: "email" });
  }

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
    if (email) {
      inBackground(async () => {
        if (!(await users.findByEmail(email))) await sendVerification(user, email);
      });
    }
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

router.post("/login", loginLimit, async (req, res) => {
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

//who am I: the account details the settings page shows
router.get("/me", restricted, async (req, res) => {
  try {
    const user = await users.findBy({ id: req.user.id }).first();
    if (!user) {
      return res.status(401).json({ message: "Please sign in again.", field: "form" });
    }
    res.status(200).json({ username: user.username, email: user.email || null });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again.", field: "form" });
  }
});

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

// start adding (or changing) the account's email; it only counts once the link is clicked
router.put("/email", restricted, tokenLimit, async (req, res) => {
  const email = cleanEmail(req.body.email);
  if (!email) {
    return res
      .status(400)
      .json({ message: "That email address doesn't look right.", field: "email" });
  }

  try {
    const user = await confirmPassword(req, res, req.body.password);
    if (!user) return;

    const owner = await users.findByEmail(email);
    if (owner && owner.id !== user.id) {
      return res
        .status(409)
        .json({ message: "That email is already used by another account.", field: "email" });
    }
    if (owner) {
      return res
        .status(200)
        .json({ message: "That email is already confirmed on your account." });
    }

    try {
      await sendVerification(user, email);
    } catch (err) {
      console.log("Email problem:", err.message);
      return res.status(502).json({
        message: "We couldn't send the email right now. Please try again later.",
        field: "form",
      });
    }
    res.status(200).json({
      message: `We sent a confirmation link to ${email}. Open it to finish.`,
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again.", field: "form" });
  }
});

// the link in the confirmation email lands here
router.post("/verify-email", tokenLimit, async (req, res) => {
  try {
    const row = await emailTokens.consume(req.body.token, "verify");
    if (!row) {
      return res.status(400).json({
        message: "That link is invalid or has expired. Ask for a new one in Settings.",
        field: "form",
      });
    }
    const owner = await users.findByEmail(row.new_email);
    if (owner && owner.id !== row.user_id) {
      return res
        .status(409)
        .json({ message: "That email is already used by another account.", field: "form" });
    }
    await users.update(row.user_id, { email: row.new_email });
    res.status(200).json({ email: row.new_email });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again.", field: "form" });
  }
});

router.delete("/email", restricted, async (req, res) => {
  try {
    const user = await confirmPassword(req, res, req.body.password);
    if (!user) return;
    await users.update(user.id, { email: null });
    res.status(200).json({ message: "Email removed." });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again.", field: "form" });
  }
});

// always the same answer, so the page can't be used to find out who has an account
const FORGOT_REPLY = {
  message:
    "If that account has a confirmed email, we've sent a link to reset the password.",
};

router.post("/forgot-password", forgotLimit, async (req, res) => {
  const who = typeof req.body.identifier === "string" ? req.body.identifier.trim() : "";
  if (!who) {
    return res
      .status(400)
      .json({ message: "Enter your username or email.", field: "identifier" });
  }

  res.status(200).json(FORGOT_REPLY);

  inBackground(async () => {
    const user = who.includes("@")
      ? await users.findByEmail(who.toLowerCase())
      : await users.findBy({ username: who }).first();
    if (!user || !user.email) return;
    if (Date.now() - (await emailTokens.lastIssuedAt(user.id, "reset")) < RESEND_COOLDOWN) {
      return;
    }
    const token = await emailTokens.issue({
      userId: user.id,
      type: "reset",
      ttlMs: RESET_TTL,
    });
    await mailer.sendResetEmail(user.email, user.username, token);
  });
});

router.post("/reset-password", tokenLimit, async (req, res) => {
  const { token, newPassword } = req.body;

  if (typeof newPassword !== "string" || newPassword.length < MIN_PASSWORD) {
    return res.status(400).json({
      message: `New password must be at least ${MIN_PASSWORD} characters.`,
      field: "newPassword",
    });
  }

  try {
    const row = await emailTokens.consume(token, "reset");
    if (!row) {
      return res.status(400).json({
        message: "That link is invalid or has expired. Ask for a new one.",
        field: "form",
      });
    }
    const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 8;
    await users.update(row.user_id, {
      password: bcryptjs.hashSync(newPassword, rounds),
    });
    res.status(200).json({ message: "Password updated. You can sign in now." });
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
