const userService = require('../services/user.service');

async function createUser(req, res) {
  // get the username, email, and password from the request body
  const { username, email, password } = req.body;
  // store the result of the registerUser function in the user variable for use later in authentication
  const user = await userService.createUser(username, email, password);

  // same code seen in the snippet from src/api/controllers/auth.controller.js
  req.login(user, (err) => {
    req.session.ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    req.session.userAgent = req.headers['user-agent'];
    return res.status(201).json({ message: `User '${user.username}' created successfully` });
  });
}

async function getUserByUsername(req, res) {
  // get the requesting user verified from the session
  const requestingUser = req.user;
  // turn the fields query string into an array
  const fields = req.query.fields ? req.query.fields.split(',') : [];
  const username = req.params.username;
  const user = await userService.getUserByUsername(requestingUser, username, fields);
  res.status(200).json(user);
}

async function updateUser(req, res) {
  // get the requesting user verified from the session
  const requestingUser = req.user;
  // get the username of the user to update
  const username = req.params.username;
  // multer middleware adds the file to the request object
  const file = req.file;
  // password is destructured from the body and the rest of the fields are stored in updatedFields
  const { currentPassword, ...updatedFields } = req.body;
  const changes = await userService.updateUser(requestingUser, username, currentPassword, updatedFields, file);
  res.status(200).json(changes);
}

async function deleteUser(req, res) {
  // get the requesting user verified from the session
  const requestingUser = req.user;
  // get the username of the user to delete
  const username = req.params.username;
  // get the password from the request body
  const { password } = req.body;
  // delete the user
  await userService.deleteUser(requestingUser, username, password);
  res.status(204).end();
}

async function requestVerification(req, res) {
  const { email } = req.body;
  await userService.requestVerification(email);
  res.status(200).json({ message: 'Verification email sent' });
}

async function verifyEmail(req, res) {
  // should be moved to validations
  if (!req.headers.authorization) return res.status(400).json({ message: 'Token is required' });
  const token = req.headers.authorization.split(' ')[1];
  await userService.verifyEmail(token);
  res.status(200).json({ message: 'Email verified' });
}

module.exports = {
  createUser,
  getUserByUsername,
  updateUser,
  deleteUser,
  requestVerification,
  verifyEmail,
};
