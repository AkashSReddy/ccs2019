const Promise = require("bluebird");
const User = require("../models/applicant");
const userService = require("../services/userService");
require("dotenv").config();

/**
 * @function getUsers
 */
module.exports.getUsers = async () => {
  try {
    let users = await User.find({});
    return users;
  } catch (err) {
    next(err);
  }
}

/**
 * @function addUser
 * @param {Object}
 */
module.exports.addUser = async userDetails => {
  try {
    let user = await User.findOne({
      $or: [{ regno: userDetails.regno }, { email: userDetails.email }]
    })

    // console.log("query success");
    console.log(user);

    if (user) {
      message = "User already registered";
      return message;
    }
    message = userService.validate(userDetails);
    console.log(message);

    if (message !== "ok") return message;
    let newUser = new User(userDetails);
    if (userDetails.password === process.env.ADMIN_PASS) {
      newUser.role = "admin";
    }
    newUser.name = userDetails.name;
    newUser.email = userDetails.email;
    newUser.regno = userDetails.regno;
    newUser.phone = userDetails.phone;
    newUser.gender = userDetails.gender;
    newUser.compete = userDetails.compete;
    newUser.password = newUser.generateHash(userDetails.Password);
    console.log("password hashed");

    let savedUser = await newUser.save();
    if (savedUser) {
      return "ok";
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

/**
 * @function deleteUser
 * @param {Object}
 */
module.exports.deleteUser = async (id) => {
  try {
    let user = await User.findByIdAndRemove(id)
    if (!user) {
      let error = new Error("User doesn't exist");
      throw error;
    }
    return "Yes";
  } catch (error) {
    return error;
  }
};

/**
 * @function updateUser
 * @param {Object}
 */
module.exports.updateUser = async userDetails => {
  try {
    let user = await User.findByIdAndUpdate(
      userDetails._id,
      { $set: userDetails },
      { new: true }
    )
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    return error;
  }
};
