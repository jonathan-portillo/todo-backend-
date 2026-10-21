# Task Note API

The REST API behind [Task Note](https://github.com/jonathan-portillo/todo-frontend-), a to-do app where each list is a card you can place, resize and organise into tabs. Built with Node, Express and Knex on SQLite.

## Contents

- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [How the data fits together](#how-the-data-fits-together)
- [Endpoints](#endpoints)
- [Auth responses](#auth-responses)
- [Behaviours worth knowing](#behaviours-worth-knowing)
- [Known limitations](#known-limitations)
- [History](#history)

## Getting started

```
git clone https://github.com/jonathan-portillo/todo-backend-.git
cd todo-backend-
npm install
```

Create a `.env` file (see [Environment variables](#environment-variables)), then set up the database and start the server:

```
npx knex migrate:latest     # creates / updates the SQLite database
npm run server              # development, restarts on changes (nodemon)
npm start                   # plain node
```

The API answers at `http://localhost:<PORT>/`. `GET /` returns `{ "api": "server is up" }`.

Run `npx knex migrate:latest` again whenever you pull new code. New features (trash, tabs, card positions and sizes) each add a migration, and the API will return errors until they have run.

The frontend expects the API on port **4000**, so use `PORT=4000` for local development.

## Environment variables

| Variable        | Required | Default                | What it does                                        |
| :-------------- | :------- | :--------------------- | :-------------------------------------------------- |
| `PORT`          | yes      | none                   | Port the server listens on.                         |
| `JWT_SECRET`    | no       | a built-in dev secret  | Secret used to sign login tokens. Set your own in production. |
| `BCRYPT_ROUNDS` | no       | `8`                    | Password hashing cost.                              |
| `DB_ENV`        | no       | `development`          | Which `knexfile.js` environment to use.             |

## How the data fits together

```
users ──< boards ──< todo_title ──< todo_list
 (account)  (tabs)     (a card)       (its checklist text)
```

| Table        | Columns                                                                                                    |
| :----------- | :--------------------------------------------------------------------------------------------------------- |
| `users`      | `id`, `username` (unique), `password` (bcrypt hash)                                                        |
| `boards`     | `id`, `name`, `user_id`                                                                                    |
| `todo_title` | `id`, `todo_title`, `user_id`, `board_id`, `pos_x`, `pos_y`, `width`, `height`, `deleted_at`               |
| `todo_list`  | `id`, `todo_list` (text), `todo_title_id`                                                                  |
| `description`| `id`, `description`, `todo_list_id` (older feature, still available, not used by the current frontend)    |

- A **card** on the dashboard is a row in `todo_title`. Its checklist is stored as text in `todo_list`, one item per line: `[ ] open item` or `[x] finished item`.
- `pos_x` / `pos_y` (pixels) and `width` / `height` (pixels) are where the card sits and how big it is. `null` means "not placed yet / default size".
- `deleted_at` is set when a card is in the trash. `null` means it is live.
- Deleting a user or a card removes everything that belongs to it.

Migrations live in `data/migrations/`:

| Migration                   | Adds                                  |
| :-------------------------- | :------------------------------------ |
| `20220519225951_todo_list`  | users, titles, lists, descriptions    |
| `20261020000000_trash`      | `deleted_at` (trash)                  |
| `20261020010000_card_position` | `pos_x`, `pos_y`                   |
| `20261020020000_boards`     | `boards` table and `board_id`         |
| `20261021000000_card_size`  | `width`, `height`                     |

## Endpoints

All request and response bodies are JSON.

### Auth and users

| Action               | URL              | Method | Body                          |
| :------------------- | :--------------- | :----- | :---------------------------- |
| Reach the API        | `/`              | GET    |                               |
| Register a user      | `/auth/register` | POST   | `{ username, password }`      |
| Log in               | `/auth/login`    | POST   | `{ username, password }`      |
| List users           | `/users`         | GET    |                               |

### Boards (the tabs)

| Action                                  | URL                | Method | Body       |
| :-------------------------------------- | :----------------- | :----- | :--------- |
| Get a user's boards                     | `/boards/user/:id` | GET    |            |
| Create a board                          | `/boards/user/:id` | POST   | `{ name }` |
| Rename a board                          | `/boards/:id`      | PUT    | `{ name }` |
| Delete a board (its cards go to trash)  | `/boards/:id`      | DELETE |            |

A user always has at least one board. The first `GET` creates one called "My tasks" if there are none, and the last board cannot be deleted.

### Cards (`/title`)

| Action                                         | URL                      | Method | Body                                                  |
| :--------------------------------------------- | :----------------------- | :----- | :---------------------------------------------------- |
| Get a user's live cards                        | `/title/user/:id`        | GET    |                                                       |
| Get a user's trashed cards                     | `/title/user/:id/trash`  | GET    |                                                       |
| Get one card                                   | `/title/:id`             | GET    |                                                       |
| Create a card                                  | `/title/user/:id`        | POST   | `{ todo_title, board_id?, pos_x?, pos_y? }`           |
| Rename a card                                  | `/title/:id`             | PUT    | `{ todo_title }`                                      |
| Save where the card sits                       | `/title/:id/position`    | PUT    | `{ pos_x, pos_y }`                                    |
| Save how big the card is                       | `/title/:id/size`        | PUT    | `{ width, height }`                                   |
| Move the card to another board                 | `/title/:id/board`       | PUT    | `{ board_id }`                                        |
| Move the card to the trash                     | `/title/:id`             | DELETE |                                                       |
| Restore a card from the trash                  | `/title/:id/restore`     | PUT    |                                                       |
| Delete a card forever                          | `/title/:id/permanent`   | DELETE |                                                       |
| Get every card (all users)                     | `/title`                 | GET    |                                                       |

Notes:

- `pos_x` may be negative (a card can sit left of the dashboard column). `pos_y` must be 0 or more.
- `width` is kept between 240 and 1200, `height` between 120 and 2400.
- `board_id` must be a board that belongs to the same user.
- A card needs a `todo_title`. The frontend sends "Untitled" when none is typed.

### Checklists (`/todoList`)

| Action                                  | URL                    | Method | Body            |
| :-------------------------------------- | :--------------------- | :----- | :-------------- |
| Get every list                          | `/todoList`            | GET    |                 |
| Get a list by its id                    | `/todoList/:id`        | GET    |                 |
| Get the list of a card                  | `/todoList/:id/title`  | GET    |                 |
| Create the list for a card              | `/todoList/:id/title`  | POST   | `{ todo_list }` |
| Update a list                           | `/todoList/:id`        | PUT    | `{ todo_list }` |
| Delete a list                           | `/todoList/:id`        | DELETE |                 |

`todo_list` is the checklist text described above (`[ ] item` / `[x] item`, one per line).

### Descriptions (`/description`)

| Action                               | URL                      | Method | Body            |
| :----------------------------------- | :----------------------- | :----- | :-------------- |
| Get every description                | `/description`           | GET    |                 |
| Get a description by its id          | `/description/:id`       | GET    |                 |
| Get the description of a list        | `/description/:id/list`  | GET    |                 |
| Create a description for a list      | `/description/:id/list`  | POST   | `{ description }` |
| Update a description                 | `/description/:id`       | PUT    | `{ description }` |
| Delete a description                 | `/description/:id`       | DELETE |                 |

## Auth responses

Success:

```json
// POST /auth/register   -> 201
{ "id": "7", "cred": { "username": "sam" }, "token": "<jwt>" }

// POST /auth/login      -> 201
{ "id": "7", "message": "Welcome sam", "token": "<jwt>" }
```

Failures carry a `message` and a `field` (`username`, `password` or `form`) so a form can show the error next to the right input:

| Situation                            | Status | `field`    | `message`                                                  |
| :----------------------------------- | :----- | :--------- | :--------------------------------------------------------- |
| Register: missing username/password  | 400    | `form`     | Enter a username and a password.                           |
| Register: username already exists    | 409    | `username` | That username is already taken. Try signing in instead.    |
| Login: missing username/password     | 400    | `form`     | Enter your username and password.                          |
| Login: no such username              | 401    | `username` | We couldn't find an account with that username.            |
| Login: wrong password                | 401    | `password` | That password is incorrect.                                |
| Anything unexpected                  | 500    | `form`     | Something went wrong. Please try again.                    |

Tokens last one day.

## Behaviours worth knowing

- **Trash is a soft delete.** `DELETE /title/:id` only sets `deleted_at`. The card and its list stay in the database until `DELETE /title/:id/permanent`, and `PUT /title/:id/restore` brings it back.
- **Deleting a board** moves its cards to the trash and detaches them. A restored card with no board is adopted by the user's first board the next time boards are loaded.
- **Older data is adopted automatically.** Cards created before boards existed have no `board_id`, and are assigned to the user's first board the first time `GET /boards/user/:id` is called.

## Known limitations

- **Routes are not protected by the login token.** Tokens are issued, but the other endpoints do not check them yet, and the user id comes from the URL. This is fine for a personal project, but it needs middleware before real use.
- **`GET /title` and `GET /users` list data for every account.**
- **`npm test`** is not wired up yet (`___test___/` has a starting Jest file).
- **`data/todo_list.db3`** is the local development database and is tracked in git. Local runs change it, so avoid committing it with real accounts in it.

## History

- Original build (2022 to 2023): users, auth, titles, lists and descriptions, validation middleware, CORS for the frontend, a fix for the id on authentication.
- Trash, card positions and sizes, boards (tabs), and clearer auth errors were added alongside the frontend redesign.
- Earlier deployments ran on Heroku (`https://jonstodo.herokuapp.com/`) and have expired. The original commits are at https://github.com/jonathan-portillo/TODO/tree/main/todo-backend.
