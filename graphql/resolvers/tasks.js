const Task = require("../../models/task");
const User = require("../../models/user");
const House = require("../../models/house");
const { transformTask } = require("./merge");

module.exports = {
  tasks: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("unauthenticated");
    }
    let houseId;
    try {
      const creator = await User.findById(req.userId);
      if (!creator) {
        throw new Error("User not found");
      }
      houseId = creator.house;
      const tasks = await Task.find({ house: houseId });
      return tasks.map(task => {
        return transformTask(task);
      });
    } catch (err) {
      throw err;
    }
  },
  createTask: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("unauthenticated");
    }
    let createdTask;
    let houseId;
    try {
      const creator = await User.findById(req.userId);
      if (!creator) {
        throw new Error("User not found");
      }
      houseId = creator.house;
      const task = new Task({
        title: args.taskInput.title,
        description: args.taskInput.description,
        price: +args.taskInput.price,
        date: new Date(args.taskInput.date),
        endDate: new Date(args.taskInput.endDate),
        creator: req.userId,
        house: houseId,
        progress: "created"
      });
      const result = await task.save();
      createdTask = transformTask(result);
      creator.createdTasks.push(task);
      await creator.save();
      await House.updateOne({ _id: houseId }, { $push: { tasks: result } });
      return createdTask;
    } catch (err) {
      throw err;
    }
  },
  assignTask: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("unauthenticated");
    }
    let assignedTask;
    try {
      const assignedPerson = await User.findById(req.userId);
      if (!assignedPerson) {
        throw new Error("User not found");
      }
      await Task.updateOne(
        { _id: args.taskId },
        { $set: { assignee: assignedPerson } }
      );
      await Task.updateOne(
        { _id: args.taskId },
        { $set: { progress: "assigned" } }
      );
      const fetchedTask = await Task.findById({ _id: args.taskId });
      if (!fetchedTask) {
        throw new Error("Task not found");
      }
      await User.updateOne(
        { _id: req.userId },
        { $push: { assignedTasks: fetchedTask } }
      );
      assignedTask = transformTask(fetchedTask);
      return assignedTask;
    } catch (err) {
      throw err;
    }
  },
  unassignTask: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("unauthenticated");
    }
    let unassignedTask;
    try {
      const fetchedTask = await Task.findById({ _id: args.taskId });
      if (!fetchedTask) {
        throw new Error("Task not found");
      }
      if (fetchedTask._doc.assignee != req.userId) {
        throw new Error("Cannot unassign task not assigned to yourself");
      }
      await Task.updateOne({ _id: args.taskId }, { $set: { assignee: null } });
      await Task.updateOne(
        { _id: args.taskId },
        { $set: { progress: "created" } }
      );
      await User.updateOne(
        { _id: req.userId },
        { $pull: { assignedTasks: args.taskId } }
      );
      const assignedUser = await User.findById(req.userId);
      if (!assignedUser) {
        throw new Error("User not found");
      }
      unassignedTask = transformTask(fetchedTask);
      return unassignedTask;
    } catch (err) {
      throw err;
    }
  },
  deleteTask: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("unauthenticated");
    }
    let deletedTask;
    try {
      const result = await Task.findById({ _id: args.taskId });
      if (!result) {
        throw new Error("Task not found");
      }
      if (result._doc.creator != req.userId) {
        throw new Error("Cannot delete task not created by yourself");
      }
      await Task.deleteOne({ _id: args.taskId });
      await User.updateOne(
        { _id: result._doc.creator },
        { $pull: { createdTasks: args.taskId } }
      );
      await House.updateOne(
        { _id: result._doc.house },
        { $pull: { tasks: args.taskId } }
      );
      if (result._doc.assignee !== null) {
        await User.updateOne(
          { _id: result._doc.assignee },
          { $pull: { assignedTasks: args.taskId } }
        );
      }
      deletedTask = transformTask(result);
      return deletedTask;
    } catch (err) {
      throw err;
    }
  },
  completeTask: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("unauthenticated");
    }
    let completedTask;
    try {
      const result = await Task.findById({ _id: args.taskId });
      if (!result) {
        throw new Error("Task not found");
      }
      if (result._doc.assignee != req.userId) {
        throw new Error("Cannot complete task not assigned to yourself");
      }
      if (result._doc.assignee !== null) {
        await User.updateOne(
          { _id: result._doc.assignee },
          { $pull: { assignedTasks: args.taskId } }
        );
      }
      await Task.updateOne(
        { _id: args.taskId },
        { $set: { progress: "completed" } }
      );
      completedTask = transformTask(result);
      return completedTask;
    } catch (err) {
      throw err;
    }
  }
};
