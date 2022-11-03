Welcome to my Todo List API all documentation will go here. This is a personal project that I have created to brush up on my restful API. I will be connecting this to a front-end stay tunned for that.

## STATUS

Added validation middleware to API, some of the endpoints require refactoring for easier understading and less confusion. Seeds and Testing coming soon!!!

Please make sure you read though all of the documentation!!

Link to the API is right here!!
https://jonstodoapp.herokuapp.com/

You can see original commits here https://github.com/jonathan-portillo/TODO/tree/main/todo-backend !!!

| Main actions        | URL            | Method |
| :------------------ | :------------- | :----- |
| Reach the API       | /              | GET    |
| Register a user     | /auth/register | POST   |
| Login a user        | /auth/login    | POST   |
| Get a list of users | /users         | GET    |

| Todo title actions                        | URL             | Method |
| :---------------------------------------- | :-------------- | :----- |
| Get a title of a todo list                | /title          | GET    |
| Find a users todo list based on title     | /title/user/:id | GET    |
| Find title of todo list based on id       | /title/:id      | GET    |
| Create a todo list title with user id     | /title/user/:id | POST   |
| Update todo list title using todo list id | /title/:id      | PUT    |
| Delete a todo list by deleting title id   | /title/:id      | DELETE |

| Todo list actions                     | URL                 | Method |
| :------------------------------------ | :------------------ | :----- |
| Find all todo list items              | /todoList           | GET    |
| Find a list based on its id           | /todoList/:id       | GET    |
| Find a list based on its title id     | /todoList/:id/title | GET    |
| Create a new todo using todo title id | /todoList/:id/title | POST   |
| Update a todo using its id            | /todoList/:id       | PUT    |
| Delete a todo                         | /todoList/:id       | DELETE |

| Description actions                                    | URL                   | Method |
| :----------------------------------------------------- | :-------------------- | :----- |
| Find all descriptions                                  | /description          | GET    |
| Find a description of a todo based on its todo list id | /descritpion/:id/list | GET    |
| Find a discription based on its id                     | /description/:id      | GET    |
| Create a description for a todo using the todo list id | /description/:id/list | POST   |
| Update a description using its id                      | /description/:id      | PUT    |
| Delete a description                                   | /description/:id      | DELETE |

## Username Registration

| PROPERTY | TYPE   | EXAMPLE           | Notes    |
| :------- | :----- | :---------------- | :------- |
| username | string | "user1"           | required |
| password | string | "thisisapassword" | required |

## Username Login

| PROPERTY | TYPE   | EXAMPLE           | Notes    |
| :------- | :----- | :---------------- | :------- |
| Title    | string | "user1"           | required |
| password | string | "thisisapassword" | required |

## Todo Title

| PROPERTY   | TYPE   | EXAMPLE    | Notes    |
| :--------- | :----- | :--------- | :------- |
| todo_title | string | "Comp Sci" | required |

## Todo List

| PROPERTY  | TYPE   | EXAMPLE  | Notes    |
| :-------- | :----- | :------- | :------- |
| todo_list | string | "Python" | required |

## Description

| PROPERTY    | TYPE   | EXAMPLE        | Notes    |
| :---------- | :----- | :------------- | :------- |
| description | string | "Binary Trees" | required |
