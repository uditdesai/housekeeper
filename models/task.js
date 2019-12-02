const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const taskSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: false
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  house: {
    type: Schema.Types.ObjectId,
    ref: "House"
  },
  assignee: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  progress: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Task", taskSchema);
