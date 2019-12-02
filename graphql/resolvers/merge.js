const Task = require("../../models/task");
const User = require("../../models/user");
const House = require("../../models/house");
const { dateToString } = require("../../helpers/date");

const tasks = async taskIds => {
  try {
    const tasks = await Task.find({ _id: { $in: taskIds } });
    return tasks.map(task => {
      return transformTask(task);
    });
  } catch (err) {
    throw err;
  }
};

const houseData = async houseId => {
  try {
    const house = await House.findById(houseId);
    return {
      ...house._doc,
      _id: house.id
    };
  } catch (err) {
    throw err;
  }
};

const user = async userId => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      _id: user.id,
      createdTasks: tasks.bind(this, user._doc.createdTasks),
      assignedTasks: tasks.bind(this, user._doc.assignedTasks)
    };
  } catch (err) {
    throw err;
  }
};

const transformTask = task => {
  return {
    ...task._doc,
    _id: task.id,
    date: dateToString(task._doc.date),
    endDate: dateToString(task._doc.endDate),
    creator: user.bind(this, task.creator),
    assignee: user.bind(this, task.assignee)
  };
};

exports.transformTask = transformTask;
exports.houseData = houseData;
