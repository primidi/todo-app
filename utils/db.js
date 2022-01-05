const mongoose = require("mongoose");
const Todolist = require("../model/todolist");

mongoose.connect("mongodb://127.0.0.1:27017/todo", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// // For test add new data to collection
// const todolist1 = new Todolist({
//   todo: "Breakfast",
//   description: "Don't forget to take breakfast first!",
// });

// // Save data to collection
// todolist1.save().then((result) => console.log(result));
