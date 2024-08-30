const bcryptjs = require('bcryptjs');

const saltRounds = process.env.SALT_ROUNDS || 10;

async function hashPassword(password) {
  return bcryptjs.hash(password, saltRounds);
}

async function comparePasswords(plainPassword, hashedPassword) {
  if (!plainPassword || !hashedPassword) return false;
  const match = await bcryptjs.compare(plainPassword, hashedPassword);
  return match;
}

module.exports = {
  hashPassword,
  comparePasswords,
};
