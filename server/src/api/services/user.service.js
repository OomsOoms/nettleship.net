const { User } = require('../models');
const { generateJwt, comparePasswords, sendEmail } = require('../helpers');
const { Error } = require('../helpers');

// if a user hasnt verified their email within a certain time frame, they should be deleted
// jwt token method im using might not be the best for this so i might need to change it
async function registerUser(username, email, password) {
  try {
    const user = new User({ username, email, password });
    await user.save();
    const token = generateJwt({ id: user._id }, { expiresIn: '10m' });
    const verificationLink = `${process.env.DOMAIN}/api/users/verify?token=${token}`;
    sendEmail(email, 'Verify your email', verificationLink);

    return true;
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyValue.username) {
        throw Error.mongoConflictError('Username already exists');
      } else {
        throw Error.mongoConflictError('Email already exists');
      }
    }
    // Throw an error if its not a duplicate key error
    throw error;
  }
}

// Figure out what im doing with JWT because this isnt very stateless
async function getAllUsers(id) {
  const user = await User.findById(id);
  if (!user.roles.includes('admin')) {
    throw Error.invalidCredentials();
  }
  const users = await User.find();
  return users;
}

async function verifyUser(id) {
  const user = await User.findById(id);
  user.active = true;
  await user.save();
}

async function requestVerification(email) {
  const user = await User.findOne({ email });
  if (!user || user.active) {
    throw Error.userNotFound('User not found or already verified');
  }
  const token = generateJwt({ id: user._id });
  const verificationLink = `${process.env.DOMAIN}/api/users/verify?token=${token}`;
  console.log(verificationLink); // would be emailed but ill leave that for now
}

async function getCurrentUser(id) {
  const user = await User.findById(id);
  if (!user) {
    throw Error.userNotFound(`User with id ${id} not found`);
  }
  return user;
}

// probably change this to not require password
async function updateUser(id, password, newUsername, newEmail, newPassword) {
  try {
    const user = await User.findById(id);

    if (!user || !(await comparePasswords(password, user.password))) {
      throw Error.invalidCredentials();
    }

    // Prepare the new data for the user
    const newData = {
      username: newUsername || user.username,
      email: newEmail || user.email,
      password: newPassword || user.password,
    };

    // Check if any of the specified fields have changed and throw an error if not
    const fieldsToCheck = ['username', 'email', 'password'];
    const hasChanged = fieldsToCheck.some(
      (field) => newData[field] !== undefined && newData[field] !== user[field]
    );

    if (!hasChanged) {
      throw Error.invalidRequest('No changes detected');
    }

    // Update the user with the new data
    Object.assign(user, newData);
    const updatedUser = await user.save();

    const token = generateJwt({ id: updatedUser._id });
    return { user: updatedUser, token: token };
  } catch (error) {
    // If there's a conflict with the new email, throw a specific error
    if (error.code === 11000) {
      throw Error.mongoConflictError('Email already exists');
    }
    throw error;
  }
}

async function deleteUser(id, password) {
  const user = await User.findById(id);
  if (!user || !(await comparePasswords(password, user.password))) {
    throw Error.invalidCredentials();
  }
  await User.deleteOne({ _id: id });
}

module.exports = {
  registerUser,
  getAllUsers,
  verifyUser,
  requestVerification,
  getCurrentUser,
  updateUser,
  deleteUser,
};
