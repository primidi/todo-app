// Web server using Express
const express = require("express");
const expressLayouts = require("express-ejs-layouts");

// Express validator for validation
const { body, validationResult, check } = require("express-validator");

// Method Override for HTTP verb override
const methodOverride = require("method-override");

// Flash Message
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

// Database connection
require("./utils/db");

// Import todolist's schema
const Todolist = require("./model/todolist");

const app = express();
const port = 3000;

// Method Override setup
app.use(methodOverride("_method"));

// EJS setup
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Flash Message setup
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

// Home Page
app.get("/", (req, res) => {
  res.render("index", {
    layout: "layouts/main-layout",
    title: "To Do List App | Home",
    creator: "Primidi",
  });
});

// Todos Page
app.get("/todos", async (req, res) => {
  const todolists = await Todolist.find();
  res.render("todos", {
    layout: "layouts/main-layout",
    title: "To Do List App | Todos",
    todolists,
    msg: req.flash("msg"),
  });
});

// About Page
app.get("/about", (req, res) => {
  res.render("about", {
    layout: "layouts/main-layout",
    title: "To Do List App | About",
  });
});

// Todo add form
app.get("/todos/add", (req, res) => {
  res.render("add-todos", {
    layout: "layouts/main-layout",
    title: "To Do List App | Add To Do",
  });
});

// Add todo data processes
app.post(
  "/todos",
  [
    body("todo").custom(async (value) => {
      const duplicate = await Todolist.findOne({ todo: value });
      if (duplicate) {
        throw new Error(`The todo's of ${value} is being used, please use another todo name!`);
      }
      return true;
    }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("add-todos", {
        layout: "layouts/main-layout",
        title: "To Do List App | Add To Do",
        errors: errors.array(),
      });
    } else {
      Todolist.insertMany(req.body, (error, result) => {
        // Send the flash message
        req.flash("msg", "New todo added!");
        res.redirect("todos");
      });
    }
  }
);

// Mark as done (delete) processes
app.delete("/todos", (req, res) => {
  Todolist.deleteOne({ todo: req.body.todo }).then((result) => {
    // Send the flash message
    req.flash("msg", "Todo done!");
    res.redirect("/todos");
  });
});

// Todo edit form
app.get("/todos/edit/:todo", async (req, res) => {
  const todolist = await Todolist.findOne({ todo: req.params.todo });
  res.render("edit-todos", {
    layout: "layouts/main-layout",
    title: "To Do List | Edit To Do",
    todolist,
  });
});

// Edit todo data processes
app.put(
  "/todos",
  [
    body("todo").custom(async (value, { req }) => {
      const duplicate = await Todolist.findOne({ todo: value });
      if (value !== req.body.oldTodo && duplicate) {
        throw new Error(`The todo's of ${value} is being used, please use another todo name!`);
      }
      return true;
    }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("edit-todos", {
        layout: "layouts/main-layout",
        title: "To Do App | Edit To Do",
        errors: errors.array(),
        todolist: req.body,
      });
    } else {
      Todolist.updateOne(
        {
          _id: req.body._id,
        },
        {
          $set: {
            todo: req.body.todo,
            description: req.body.description,
          },
        }
      ).then((result) => {
        // Send the flash message
        req.flash("msg", "Todo edited!");
        res.redirect("/todos");
      });
    }
  }
);

app.listen(port, () => {
  console.log(`Todo App is listening at http://localhost:${port}`);
});
