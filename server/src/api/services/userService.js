const User = require("../models/user");
const generateToken = require("../helpers/generateJwt");
const passwordHasher = require("../helpers/passwordHasher");

async function registerUser(username, email, password) {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email already registered");
  }

  const user = new User({ username, email, password });
  await user.save();

  const token = generateToken({ id: user._id });
  return { user, token };
}

async function getUserById(id) {
  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}

async function updateUser(id, password, newUsername, newEmail, newPassword) {
  const user = await User.findById(id);
  const isPasswordValid =
    user && (await passwordHasher.comparePasswords(password, user.password));
  if (!isPasswordValid || !user) {
    throw new Error("Invalid credentials");
  }

  if (
    // I dont think this works
    (newPassword && newPassword !== user.email) ||
    (newUsername && newUsername !== user.email) ||
    (newEmail && newEmail !== user.email)
  ) {
    console.log("updating");
    user.username = newUsername || user.username;
    user.email = newEmail || user.email;
    user.password = newPassword || user.password;
    try {
      await user.save();
    } catch (error) {
      throw new Error("Error saving changes");
    }

    const token = generateToken({ id: user._id });
    return { user, token };
  } else {
    throw new Error("Details not not changed");
  }
}

async function deleteUser(id, password) {
  const user = await User.findById(id);
  const isPasswordValid =
    user && (await passwordHasher.comparePasswords(password, user.password));
  if (!isPasswordValid || !user) {
    throw new Error("Invalid credentials");
  }
  await User.deleteOne({ _id: id });
}

async function loginUser(email, password) {
  const user = await User.findOne({ email });
  const isPasswordValid =
    user && (await passwordHasher.comparePasswords(password, user.password));
  if (!isPasswordValid || !user) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken({ id: user._id });
  return { user, token };
}

module.exports = {
  registerUser,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
};
