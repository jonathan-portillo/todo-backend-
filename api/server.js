const express = require("express");
const server = express();

const usersRouter = require("./users/users-router");
const authRouter = require("../auth/auth-router");
const titleRouter = require("../api/todo/todo-title/todo_title-router");
const todoListRouter = require("../api/todo/toto-list/todo_list_router");
const descriptionRouter = require("../api/todo/description/description-router");

server.use(express.json());

server.use("/auth", authRouter);
server.use("/users", usersRouter);
server.use("/title", titleRouter);
server.use("/todoList", todoListRouter);
server.use("/description", descriptionRouter);

server.get("/", (req, res) => {
  res.json({ api: "server is up" });
});

module.exports = server;
