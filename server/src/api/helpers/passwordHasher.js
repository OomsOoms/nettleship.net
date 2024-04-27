const bcryptjs = require('bcryptjs');

const saltRounds = process.env.SALT_ROUNDS || 10;

async function hashPassword(password) {
  try {
    const hashedPassword = await bcryptjs.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    throw error;
  }
}

async function comparePasswords(plainPassword, hashedPassword) {
  try {
    const match = await bcryptjs.compare(plainPassword, hashedPassword);
    return match;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  hashPassword,
  comparePasswords,
};
