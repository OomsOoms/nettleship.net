const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const gameSessionRoutes = require('./game.routes');

module.exports = (app) => {
  app.use('/auth', authRoutes);
  app.use('/users', userRoutes);
  app.use('/games', gameSessionRoutes);
};
