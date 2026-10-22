const express = require("express");
const server = express();
const cors = require("cors");

const authRouter = require("../auth/auth-router");
const restricted = require("../middleware/restricted");
const titleRouter = require("../api/todo/todo-title/todo_title-router");
const boardsRouter = require("../api/todo/boards/boards-router");
const todoListRouter = require("../api/todo/toto-list/todo_list_router");
const descriptionRouter = require("../api/todo/description/description-router");

// behind the host's proxy, so rate limits see the real client address
server.set("trust proxy", 1);

server.use(express.json());
server.use(cors());

server.use("/auth", authRouter);
// everything below needs a signed-in user
server.use("/title", restricted, titleRouter);
server.use("/boards", restricted, boardsRouter);
server.use("/todoList", restricted, todoListRouter);
server.use("/description", restricted, descriptionRouter);

server.get("/", (req, res) => {
  res.json({ api: "server is up" });
});

module.exports = server;
