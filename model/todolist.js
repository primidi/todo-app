const mongoose = require("mongoose");

const Todolist = mongoose.model("Todolist", {
  todo: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
});

module.exports = Todolist;
