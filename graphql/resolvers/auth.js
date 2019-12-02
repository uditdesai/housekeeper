const User = require("../../models/user");
const House = require("../../models/house");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { houseData } = require("./merge");

module.exports = {
  createUser: async args => {
    let userHouseId;
    try {
      const existingUser = await User.findOne({ email: args.userInput.email });
      if (existingUser) {
        throw new Error("User exists already");
      }
      const existingHouse = await House.findOne({ name: args.userInput.house });
      if (existingHouse) {
        const isEqual = await bcrypt.compare(
          args.userInput.housePassword,
          existingHouse.password
        );
        if (!isEqual) {
          throw new Error("Wrong password");
        } else {
          userHouseId = existingHouse.id;
        }
      } else {
        hashedHousePassword = await bcrypt.hash(
          args.userInput.housePassword,
          12
        );
        const house = new House({
          name: args.userInput.house,
          password: hashedHousePassword
        });
        const houseResult = await house.save();
        userHouseId = houseResult.id;
      }
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
      const user = new User({
        name: args.userInput.name,
        email: args.userInput.email,
        password: hashedPassword,
        house: userHouseId
      });
      const result = await user.save();
      await House.updateOne({ _id: userHouseId }, { $push: { users: result } });
      return {
        ...result._doc,
        password: null,
        _id: result.id,
        house: houseData.bind(this, result.house)
      };
    } catch (err) {
      throw err;
    }
  },
  login: async ({ email, password }) => {
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("User does not exist!");
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      throw new Error("Password is incorrect");
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      "somesupersecretkey",
      { expiresIn: "2h" }
    );
    return {
      userId: user.id,
      token: token,
      tokenExpiration: 2,
      name: user._doc.name,
      house: houseData.bind(this, user.house)
    };
  }
};
