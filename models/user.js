const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  house: {
    type: Schema.Types.ObjectId,
    ref: "House"
  },
  createdTasks: [
    {
      type: Schema.Types.ObjectId,
      ref: "Task"
    }
  ],
  assignedTasks: [
    {
      type: Schema.Types.ObjectId,
      ref: "Task"
    }
  ]
});

module.exports = mongoose.model("User", userSchema);
